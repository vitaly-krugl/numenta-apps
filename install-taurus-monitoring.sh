#!/bin/bash
# ----------------------------------------------------------------------
# Numenta Platform for Intelligent Computing (NuPIC)
# Copyright (C) 2015, Numenta, Inc.  Unless you have purchased from
# Numenta, Inc. a separate commercial license for this software code, the
# following terms and conditions apply:
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero Public License for more details.
#
# You should have received a copy of the GNU Affero Public License
# along with this program.  If not, see http://www.gnu.org/licenses.
#
# http://numenta.org/licenses/
# ----------------------------------------------------------------------

set -o errexit

# nupic.bindings 0.2.1 (required by nupic 0.3.4) is not installable w/ pip.
# Install explicitly w/ easy_install, which will install from .egg (as opposed
# to .whl)
easy_install nupic.bindings==0.2.1

pip install -e ./nta.utils \
            -e ./htmegine \
            -e ./taurus_engine \
            -e ./taurus_monitoring