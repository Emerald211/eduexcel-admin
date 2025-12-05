import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetTeachersQuery } from '@/services/authApi';
import { ArrowLeft, Mail, Phone, GraduationCap, Loader2 } from 'lucide-react';
import './TeacherDetails.css';

export default function TeacherDetails() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { user } = useSelector((state: RootState) => state.auth);

	const { data: teachers = [], isLoading: loadingTeachers } =
		useGetTeachersQuery(undefined, { skip: !user?.schoolId });

	const teacher = teachers.find((t) => t.userId === userId);

	if (loadingTeachers) {
		return (
			<div className='loading-container detail-loading'>
				<Loader2 className='spinner' size={40} />
			</div>
		);
	}

	if (!teacher) {
		return (
			<div className='detail-error-container'>
				<button
					onClick={() => navigate('/dashboard/teachers')}
					className='detail-back-link'>
					<ArrowLeft size={16} /> Back to Teachers
				</button>
				<div className='empty-state'>
					<GraduationCap className='empty-icon' size={48} />
					<h3 className='empty-title'>Teacher Not Found</h3>
					<p className='empty-description'>
						The requested teacher details could not be loaded.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='detail-container'>
			<button
				onClick={() => navigate('/dashboard/teachers')}
				className='detail-back-link'>
				<ArrowLeft size={16} /> Back to Teachers
			</button>

			<div className='detail-card'>
				<div className='detail-header'>
					<div className='detail-avatar teacher'>
						<GraduationCap size={40} />
					</div>
					<div className='detail-info'>
						<h1 className='detail-name'>{teacher.name}</h1>
						<p className='detail-role'>Teacher</p>
					</div>
				</div>

				<div className='detail-section'>
					<h2 className='section-title'>Contact Information</h2>
					<div className='detail-grid'>
						<div className='detail-item'>
							<Mail size={20} className='detail-icon' />
							<div className='detail-content'>
								<span className='detail-label'>Email</span>
								<span className='detail-value'>{teacher.email}</span>
							</div>
						</div>
						<div className='detail-item'>
							<Phone size={20} className='detail-icon' />
							<div className='detail-content'>
								<span className='detail-label'>Phone</span>
								<span className='detail-value'>{teacher.phoneNumber}</span>
							</div>
						</div>
					</div>
				</div>

				{teacher.classes && teacher.classes.length > 0 && (
					<div className='detail-section'>
						<h2 className='section-title'>
							Classes Taught ({teacher.totalClasses})
						</h2>
						<div className='classes-grid'>
							{teacher.classes.map((cls) => (
								<div key={cls.id} className='class-chip-detail'>
									<div className='class-info'>
										<span className='class-name-detail'>{cls.name}</span>
										<span className='class-grade-detail'>
											Grade: {cls.gradeLevel}
										</span>
									</div>
									<span className='class-students-detail'>
										{cls.studentsEnrolled} students
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
