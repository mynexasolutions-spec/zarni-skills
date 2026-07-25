"""add reward_items and platform_features tables

Revision ID: 972790703a90
Revises: d0fb223d3106
Create Date: 2026-07-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '972790703a90'
down_revision = 'd0fb223d3106'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'reward_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(length=150), nullable=False),
        sa.Column('image_filename', sa.String(length=500), nullable=True),
        sa.Column('gradient', sa.String(length=50), nullable=True),
        sa.Column('is_popular', sa.Boolean(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'platform_features',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('gradient', sa.String(length=50), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('platform_features')
    op.drop_table('reward_items')
