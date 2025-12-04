import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetTeachersQuery, useGetStudentsQuery } from '@/services/authApi';
import {
	Users,
	GraduationCap,
	Mail,
	Phone,
	BookOpen,
	UserCircle,
	Loader2,
	Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './TeachersAndStudents.css';

type TabType = 'teachers' | 'students';

export default function TeachersAndStudents() {
	const { user } = useSelector((state: RootState) => state.auth);
	const [activeTab, setActiveTab] = useState<TabType>('teachers');
	const [searchQuery, setSearchQuery] = useState('');

	const { data: teachers = [], isLoading: loadingTeachers } =
		useGetTeachersQuery(user?.schoolId || '', { skip: !user?.schoolId });
	const { data: students = [], isLoading: loadingStudents } =
		useGetStudentsQuery(user?.schoolId || '', { skip: !user?.schoolId });

	const filteredTeachers = Array.isArray(teachers)
		? teachers.filter(
				(teacher) =>
					teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: [];

	const filteredStudents = Array.isArray(students)
		? students.filter(
				(student) =>
					student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					student.email.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: [];

	return (
		<div className='teachers-students-container'>
			<div className='page-header'>
				<h1 className='page-title'>Teachers & Students</h1>
				<p className='page-subtitle'>
					Manage your school's teachers and students
				</p>
			</div>

			<div className='tabs-container'>
				<button
					onClick={() => {
						setActiveTab('teachers');
						setSearchQuery('');
					}}
					className={`tab-button ${activeTab === 'teachers' ? 'active' : ''}`}>
					<GraduationCap size={20} />
					Teachers ({teachers.length || 0})
				</button>
				<button
					onClick={() => {
						setActiveTab('students');
						setSearchQuery('');
					}}
					className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}>
					<Users size={20} />
					Students ({students.length || 0})
				</button>
			</div>

			<div className='search-container'>
				<Search className='search-icon' size={20} />
				<input
					type='text'
					placeholder={`Search ${activeTab}...`}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='search-input'
				/>
			</div>

			{activeTab === 'teachers' && (
				<div>
					<div className='section-header'>
						<h2 className='section-title'>Teachers</h2>
						<div className='stats-badge'>
							{filteredTeachers.length} of {teachers.length} teachers
						</div>
					</div>

					{loadingTeachers ? (
						<div className='loading-container'>
							<Loader2 className='spinner' size={40} />
						</div>
					) : filteredTeachers.length === 0 ? (
						<div className='empty-state'>
							<GraduationCap className='empty-icon' size={48} />
							<h3 className='empty-title'>
								{searchQuery ? 'No teachers found' : 'No teachers yet'}
							</h3>
							<p className='empty-description'>
								{searchQuery
									? 'Try adjusting your search'
									: 'Teachers will appear here once added'}
							</p>
						</div>
					) : (
						<div className='people-grid'>
							{filteredTeachers.map((teacher) => (
								<Link
									key={teacher.userId}
									to={`teacher/${teacher.userId}`}
									className='person-card clickable-card'
									style={{ textDecoration: 'none', color: 'inherit' }}>
									<div>
										<div className='person-header'>
											<div className='avatar-circle teacher'>
												<GraduationCap size={24} />
											</div>
											<div className='person-info'>
												<h3 className='person-name'>{teacher.name}</h3>
												<p className='person-role'>Teacher</p>
											</div>
										</div>

										<div className='person-details'>
											<div className='detail-row'>
												<Mail size={16} className='detail-icon' />
												<span className='detail-text'>{teacher.email}</span>
											</div>
											<div className='detail-row'>
												<Phone size={16} className='detail-icon' />
												<span className='detail-text'>
													{teacher.phoneNumber}
												</span>
											</div>
										</div>

										{teacher.classes && teacher.classes.length > 0 && (
											<div className='classes-section'>
												<div className='classes-header'>
													<BookOpen size={16} />
													<span>Classes ({teacher.totalClasses})</span>
												</div>
												<div className='classes-list'>
													{teacher.classes.map((cls) => (
														<div key={cls.id} className='class-chip'>
															<span className='class-name'>{cls.name}</span>
															<span className='class-students'>
																{cls.studentsEnrolled} students
															</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			)}

			{activeTab === 'students' && (
				<div>
					<div className='section-header'>
						<h2 className='section-title'>Students</h2>
						<div className='stats-badge'>
							{filteredStudents.length} of {students.length} students
						</div>
					</div>

					{loadingStudents ? (
						<div className='loading-container'>
							<Loader2 className='spinner' size={40} />
						</div>
					) : filteredStudents.length === 0 ? (
						<div className='empty-state'>
							<Users className='empty-icon' size={48} />
							<h3 className='empty-title'>
								{searchQuery ? 'No students found' : 'No students yet'}
							</h3>
							<p className='empty-description'>
								{searchQuery
									? 'Try adjusting your search'
									: 'Students will appear here once enrolled'}
							</p>
						</div>
					) : (
						<div className='people-grid'>
							{filteredStudents.map((student) => (
								<Link
									key={student.userId}
									to={`student/${student.userId}`}
									className='person-card clickable-card'
									style={{ textDecoration: 'none', color: 'inherit' }}>
									<div>
										<div className='person-header'>
											<div className='avatar-circle student'>
												<Users size={24} />
											</div>
											<div className='person-info'>
												<h3 className='person-name'>{student.name}</h3>
												<p className='person-role'>Student</p>
											</div>
										</div>

										<div className='person-details'>
											<div className='detail-row'>
												<Mail size={16} className='detail-icon' />
												<span className='detail-text'>{student.email}</span>
											</div>
											<div className='detail-row'>
												<Phone size={16} className='detail-icon' />
												<span className='detail-text'>
													{student.phoneNumber}
												</span>
											</div>
											<div className='detail-row'>
												<BookOpen size={16} className='detail-icon' />
												<span className='detail-text'>
													Grade: {student.currentGradeLevel}
												</span>
											</div>
										</div>

										<div className='student-meta'>
											{student.class && (
												<div className='meta-item'>
													<span className='meta-label'>Class:</span>
													<span className='meta-value'>
														{student.class.name}
													</span>
												</div>
											)}
											{student.parent && (
												<div className='meta-item'>
													<UserCircle size={16} className='meta-icon' />
													<div>
														<span className='meta-label'>Parent:</span>
														<span className='meta-value'>
															{student.parent.name}
														</span>
													</div>
												</div>
											)}
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
