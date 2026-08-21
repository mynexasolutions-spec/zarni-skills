"""Add certificate_template to course

Revision ID: a3c8e6f1b2d4
Revises: 475fee85fcad
Create Date: 2026-08-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a3c8e6f1b2d4'
down_revision = 'c7d2f4a9e1b6'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('courses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('certificate_template', sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table('courses', schema=None) as batch_op:
        batch_op.drop_column('certificate_template')
