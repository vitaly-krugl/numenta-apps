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

"""add multi-step-best-predictions column to metric data

Revision ID: 59c9ef218d3f
Revises: 3b26d099594d
Create Date: 2016-08-08 11:50:27.101733
"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers, used by Alembic. Do not change.
revision = '59c9ef218d3f'
down_revision = '3b26d099594d'



def upgrade():
    """ Adds column 'multi_step_best_predictions' to metric_data table """
    op.add_column('metric_data', sa.Column('multi_step_best_predictions',
                                           sa.TEXT(), nullable=True))



def downgrade():
    raise NotImplementedError("Rollback is not supported.")
