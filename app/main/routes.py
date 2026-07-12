from flask import Blueprint, render_template, abort, request, flash, redirect, url_for
from app.models import Package, Course

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    packages = Package.query.filter_by(is_active=True).order_by(Package.price).all()
    courses = Course.query.filter_by(is_active=True).all()
    return render_template('index.html', packages=packages, courses=courses)


@main_bp.route('/packages')
def all_packages():
    packages = Package.query.filter_by(is_active=True).order_by(Package.price).all()
    return render_template('packages.html', packages=packages)


@main_bp.route('/courses')
def all_courses():
    from flask import request
    query = request.args.get('q', '')
    pkg_id = request.args.get('package_id', type=int)
    
    course_query = Course.query.filter_by(is_active=True)
    
    if query:
        course_query = course_query.filter(Course.title.ilike(f'%{query}%'))
    
    if pkg_id:
        selected_pkg = Package.query.get(pkg_id)
        if selected_pkg:
            course_query = course_query.filter(Course.packages.contains(selected_pkg))
    
    courses = course_query.all()
    packages = Package.query.filter_by(is_active=True).all()
    
    return render_template('courses.html', 
                         courses=courses, 
                         query=query, 
                         packages=packages, 
                         selected_pkg_id=pkg_id)


@main_bp.route('/packages/<int:pkg_id>')
def package_detail(pkg_id):
    pkg = Package.query.filter_by(id=pkg_id, is_active=True).first_or_404()
    return render_template('package_detail.html', pkg=pkg)


@main_bp.route('/courses/<int:course_id>')
def course_detail(course_id):
    course = Course.query.filter_by(id=course_id, is_active=True).first_or_404()
    # Packages that include this course (active only)
    packages = [p for p in course.packages if p.is_active]
    # For breadcrumb: use first package as source
    source_pkg = packages[0] if packages else None
    return render_template('course_detail.html', course=course, packages=packages, source_pkg=source_pkg)


@main_bp.route('/about')
def about():
    return render_template('about.html')


@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()

        if not all([name, email, subject, message]):
            flash('Please fill in all fields.', 'danger')
            return render_template('contact.html', form=request.form)

        from app.utils.email import send_email
        html_body = f"""
            <p><strong>From:</strong> {name} ({email})</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Message:</strong></p>
            <p>{message}</p>
        """
        sent = send_email(to='support@zarniskills.com', subject=f'[Contact Form] {subject}', html_body=html_body)

        if sent:
            flash("Message sent! We'll get back to you soon.", 'success')
        else:
            flash('Could not send your message right now. Please email us directly at support@zarniskills.com.', 'warning')
        return redirect(url_for('main.contact'))

    return render_template('contact.html', form=None)
