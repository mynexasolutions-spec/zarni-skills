"""add image to achievements

Revision ID: c7d2f4a9e1b6
Revises: b1c4a7e2f6d9
Create Date: 2026-08-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c7d2f4a9e1b6'
down_revision = 'b1c4a7e2f6d9'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('achievements')]
    if 'image_filename' not in cols:
        with op.batch_alter_table('achievements', schema=None) as batch_op:
            batch_op.add_column(sa.Column('image_filename', sa.String(length=256), nullable=True))


def downgrade():
    with op.batch_alter_table('achievements', schema=None) as batch_op:
        batch_op.drop_column('image_filename')
