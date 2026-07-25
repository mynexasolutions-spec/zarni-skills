"""add chapter_progress table

Revision ID: 0003ec3d2a84
Revises: 972790703a90
Create Date: 2026-07-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003ec3d2a84'
down_revision = '972790703a90'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'chapter_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('chapter_id', sa.Integer(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'chapter_id', name='uq_chapter_progress_user_chapter'),
    )


def downgrade():
    op.drop_table('chapter_progress')
