"""Update Prediction model to use JSON fields

Revision ID: 4b457625703a
Revises: 13bee8b1270b
Create Date: 2025-05-05 14:08:37.989485

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4b457625703a'
down_revision = '13bee8b1270b'
branch_labels = None
depends_on = None


def upgrade():
    # Convert `foul_model_results` to JSON
    op.alter_column(
        'prediction',
        'foul_model_results',
        existing_type=sa.VARCHAR(),
        type_=sa.JSON(),
        existing_nullable=False,
        postgresql_using="foul_model_results::json"  # Add this clause
    )

    # Convert `severity_model_results` to JSON
    op.alter_column(
        'prediction',
        'severity_model_results',
        existing_type=sa.VARCHAR(),
        type_=sa.JSON(),
        existing_nullable=False,
        postgresql_using="severity_model_results::json"  # Add this clause
    )


def downgrade():
    # Revert `foul_model_results` to VARCHAR
    op.alter_column(
        'prediction',
        'foul_model_results',
        existing_type=sa.JSON(),
        type_=sa.VARCHAR(),
        existing_nullable=False
    )

    # Revert `severity_model_results` to VARCHAR
    op.alter_column(
        'prediction',
        'severity_model_results',
        existing_type=sa.JSON(),
        type_=sa.VARCHAR(),
        existing_nullable=False
    )
    # ### end Alembic commands ###
