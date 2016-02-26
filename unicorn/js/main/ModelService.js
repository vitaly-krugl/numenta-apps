/* -----------------------------------------------------------------------------
 * Copyright © 2016, Numenta, Inc. Unless you have purchased from
 * Numenta, Inc. a separate commercial license for this software code, the
 * following terms and conditions apply:
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero Public License for
 * more details.
 *
 * You should have received a copy of the GNU Affero Public License along with
 * this program. If not, see http://www.gnu.org/licenses.
 *
 * http://numenta.org/licenses/
 * -------------------------------------------------------------------------- */

import getPortablePython from './PortablePython';
import childProcess from 'child_process';
import EventEmitter from 'events';
import system from 'os';

import UserError from './UserError';
import Utils from './Utils';

const PYTHON_EXECUTABLE = getPortablePython();

/**
 * Thrown when attempting to create more models than allowed by the system.
 */
export class MaximumConcurrencyError extends UserError {
  constructor() {
    super('Too many models running');
  }
}

/**
 * Thrown when attempting to create a model with the same ID as a prev model.
 */
export class DuplicateIDError extends UserError {
  constructor() {
    super('Duplicate model ID');
  }
}

/**
 * Thrown when attempting to perform an operation on an unknown model.
 */
export class ModelNotFoundError extends UserError {
  constructor() {
    super('Model not found');
  }
}


/**
 * Unicorn: ModelService - Respond to a ModelClient over IPC, sharing our access
 * to Unicorn Backend Model Runner python and NuPIC processes.
 */
export class ModelService extends EventEmitter {
  constructor(...args) {
    super(...args);
    this._models = new Map();
    this._maxConcurrency = this._calculateMaxConcurrency();
  }

  /**
   * Calculate max model concurrency.
   * @return {number} - Maximum concurrency for this system
   */
  _calculateMaxConcurrency() {
    // Adapted from htmengine/model_swapper/model_scheduler_service.py
    const cpus = system.cpus().length;
    const totalmem = system.totalmem();
    return Math.max(Math.min(cpus - 1, totalmem / 1073741824), 2);
  }

  /**
   * Returns the number of slots available to run new models.
   * @return {number} - Maximum available slots avilable on this system
   */
  availableSlots() {
    return this._maxConcurrency - this._models.size;
  }

  /**
   * Creates new HTM model.
   * @param  {String} modelId - Unique identifier for the model.
   *  Updates modelOpt.modelId property.
   * @param  {Object} inputOpt - Input options. See 'input_opt_schema.json'
   * @param  {Object} aggregationOpt - Aggregation options.
   *  See 'agg_opt_schema.json'
   * @param  {Object} modelOpt - Model options. See 'model_opt_schema.json'
   * @throws {@link MaximumConcurrencyError}, {@link DuplicateIDError}
   */
  createModel(modelId, inputOpt, aggregationOpt, modelOpt) {
    if (this.availableSlots() <= 0) {
      throw new MaximumConcurrencyError();
    }
    if (this._models.has(modelId)) {
      throw new DuplicateIDError();
    }

    const params = [
      '-m', 'unicorn_backend.model_runner_2',
      '--input', JSON.stringify(inputOpt),
      '--agg', JSON.stringify(aggregationOpt),
      '--model', JSON.stringify(modelOpt)
    ];
    const child = childProcess.spawn(
      PYTHON_EXECUTABLE,
      params,
      {env: Utils.createEnvWithPythonpath()}
    );
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.on('error', (error) => {
      this.emit(modelId, 'error', error);
    });

    child.stderr.on('data', (error) => {
      this.emit(modelId, 'error', error);
    });

    child.stdout.on('data', (data) => {
      this.emit(modelId, 'data', data);
    });

    child.once('close', (code) => {
      this._models.delete(modelId);
      this.emit(modelId, 'close', code);
    });

    this._models.set(modelId, {
      inputOpt, aggregationOpt, modelOpt, child
    });
  }

  /**
   * Returns a list of active models.
   * @return {Array} - List of Model IDs with the active models
   */
  getModels() {
    return Array.from(this._models.keys());
  }

  /**
   * Stops and remove the model.
   * @param {string} modelId - The model to stop
   */
  removeModel(modelId) {
    if (!this._models.has(modelId)) {
      throw new ModelNotFoundError();
    }

    const model = this._models.get(modelId);
    this._models.delete(modelId);
    model.child.kill();
    this.removeAllListeners(modelId);
  }
}
