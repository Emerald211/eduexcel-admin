import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetStudentsQuery } from '@/services/authApi';
import {
	ArrowLeft,
	Mail,
	Phone,
	BookOpen,
	Users,
	Calendar,
	UserCircle,
	Loader2,
} from 'lucide-react';
import './StudentDetails.css';

export default function StudentDetails() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { user } = useSelector((state: RootState) => state.auth);

	// Fetch the list of all students
	const { data: students = [], isLoading: loadingStudents } =
		useGetStudentsQuery(user?.schoolId || '', { skip: !user?.schoolId });

	// Find the specific student from the list
	const student = students.find((s) => s.userId === userId);

	if (loadingStudents) {
		return (
			<div className='loading-container detail-loading'>
				<Loader2 className='spinner' size={40} />
			</div>
		);
	}

	if (!student) {
		return (
			<div className='detail-error-container'>
				<button
					onClick={() => navigate('/dashboard/teachers')}
					className='detail-back-link'>
					<ArrowLeft size={16} /> Back to Students
				</button>
				<div className='empty-state'>
					<Users className='empty-icon' size={48} />
					<h3 className='empty-title'>Student Not Found</h3>
					<p className='empty-description'>
						The requested student details could not be loaded.
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
				<ArrowLeft size={16} /> Back to Students
			</button>

			<div className='detail-card'>
				<div className='detail-header'>
					<div className='detail-avatar student'>
						<Users size={40} />
					</div>
					<div className='detail-info'>
						<h1 className='detail-name'>{student.name}</h1>
						<p className='detail-role'>
							Student - Grade: {student.currentGradeLevel}
						</p>
					</div>
				</div>

				<div className='detail-section'>
					<h2 className='section-title'>Core Information</h2>
					<div className='detail-grid'>
						<div className='detail-item'>
							<Calendar size={20} className='detail-icon' />
							<div className='detail-content'>
								<span className='detail-label'>Date of Birth</span>
								<span className='detail-value'>{student.dateOfBirth}</span>
							</div>
						</div>
						{student.class && (
							<div className='detail-item'>
								<BookOpen size={20} className='detail-icon' />
								<div className='detail-content'>
									<span className='detail-label'>Class</span>
									<span className='detail-value'>{student.class.name}</span>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className='detail-section'>
					<h2 className='section-title'>Contact</h2>
					<div className='detail-grid'>
						<div className='detail-item'>
							<Mail size={20} className='detail-icon' />
							<div className='detail-content'>
								<span className='detail-label'>Email</span>
								<span className='detail-value'>{student.email}</span>
							</div>
						</div>
						<div className='detail-item'>
							<Phone size={20} className='detail-icon' />
							<div className='detail-content'>
								<span className='detail-label'>Phone</span>
								<span className='detail-value'>{student.phoneNumber}</span>
							</div>
						</div>
					</div>
				</div>

				{student.parent && (
					<div className='detail-section'>
						<h2 className='section-title'>Parent/Guardian</h2>
						<div className='detail-grid'>
							<div className='detail-item'>
								<UserCircle size={20} className='detail-icon' />
								<div className='detail-content'>
									<span className='detail-label'>Name</span>
									<span className='detail-value'>{student.parent.name}</span>
								</div>
							</div>
							<div className='detail-item'>
								<Mail size={20} className='detail-icon' />
								<div className='detail-content'>
									<span className='detail-label'>Email</span>
									<span className='detail-value'>{student.parent.email}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
