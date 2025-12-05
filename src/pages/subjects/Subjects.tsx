import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store/store';
import {
	useGetSubjectsQuery,
	useCreateSubjectMutation,
} from '@/services/authApi';
import type { SubjectInterface, CreateSubjectDto } from '@/services/authApi';
import { BookOpen, Search, Loader2, Plus, X, AlertCircle } from 'lucide-react';
import './Subjects.css';

interface RtkqError {
	status: number;
	data: {
		message: string;
	};
}

const isRtkqError = (error: unknown): error is RtkqError => {
	return (
		typeof error === 'object' &&
		error !== null &&
		'data' in error &&
		typeof (error as RtkqError).data === 'object' &&
		(error as RtkqError).data !== null &&
		'message' in (error as RtkqError).data
	);
};

export default function Subjects() {
	const navigate = useNavigate();
	const { user } = useSelector((state: RootState) => state.auth);

	const [searchQuery, setSearchQuery] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [subjectName, setSubjectName] = useState('');
	const [description, setDescription] = useState('');
	const [error, setError] = useState<string | null>(null);

	// FIX: Change argument from 'user?.schoolId || '' to 'undefined'
	const { data: subjects = [], isLoading: loadingSubjects } =
		useGetSubjectsQuery(undefined, { skip: !user?.schoolId });

	const [createSubject, { isLoading: creatingSubject }] =
		useCreateSubjectMutation();

	const filteredSubjects = subjects.filter((subject: SubjectInterface) =>
		subject.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalSubjects = subjects.length;

	const handleCreateSubject = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation: subjectName is required
		if (!subjectName) {
			setError('Subject name is required.');
			return;
		}

		const newSubjectData: CreateSubjectDto = {
			name: subjectName,
			description: description || undefined,
		};

		try {
			await createSubject(newSubjectData).unwrap();

			setSubjectName('');
			setDescription('');
			setIsModalOpen(false);
		} catch (err: unknown) {
			console.error('Failed to create subject:', err);

			if (isRtkqError(err)) {
				setError(err.data.message);
			} else {
				setError('Failed to create subject. Please check the inputs.');
			}
		}
	};

	return (
		<div className='subjects-container'>
			<div className='page-header'>
				<h1 className='page-title'>School Subjects</h1>
				<p className='page-subtitle'>
					Manage and organize all academic subjects taught.
				</p>
				<button
					className='action-button primary-button'
					onClick={() => setIsModalOpen(true)}>
					<Plus size={18} /> New Subject
				</button>
			</div>

			<div className='search-container'>
				<Search className='search-icon' size={20} />
				<input
					type='text'
					placeholder='Search subjects...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='search-input'
				/>
			</div>

			<div className='section-header'>
				<h2 className='section-title'>All Subjects</h2>
				<div className='stats-badge'>
					{filteredSubjects.length} of {totalSubjects} total
				</div>
			</div>

			{loadingSubjects ? (
				<div className='loading-container'>
					<Loader2 className='spinner' size={40} />
				</div>
			) : filteredSubjects.length === 0 && !searchQuery ? (
				<div className='empty-state'>
					<BookOpen className='empty-icon' size={48} />
					<h3 className='empty-title'>No subjects yet</h3>
					<p className='empty-description'>
						Subjects will appear here once added to the school curriculum.
					</p>
					<button
						className='action-button secondary-button'
						onClick={() => setIsModalOpen(true)}>
						<Plus size={18} /> Add Your First Subject
					</button>
				</div>
			) : filteredSubjects.length === 0 && searchQuery ? (
				<div className='empty-state'>
					<BookOpen className='empty-icon' size={48} />
					<h3 className='empty-title'>No subjects found</h3>
					<p className='empty-description'>Try adjusting your search query.</p>
				</div>
			) : (
				<div className='subject-grid'>
					{filteredSubjects.map((subject: SubjectInterface) => (
						<div
							key={subject.id}
							className='subject-card'
							onClick={() => navigate(`/dashboard/subjects/${subject.id}`)}>
							<div className='subject-header'>
								<div className='subject-avatar'>
									<BookOpen size={24} />
								</div>
								<div className='subject-info'>
									<h3 className='subject-name'>{subject.name}</h3>
									<p className='subject-description'>
										{subject.description || 'General Subject'}
									</p>
								</div>
							</div>
							<div className='subject-stats'>
								<span className='stat-item'>
									<span className='stat-value'>
										{subject.totalClassesTaught}
									</span>
									<span className='stat-label'>Classes</span>
								</span>
								<span className='stat-item'>
									<span className='stat-value'>
										{subject.totalTeachersAssigned}
									</span>
									<span className='stat-label'>Teachers</span>
								</span>
							</div>
						</div>
					))}
				</div>
			)}

			{isModalOpen && (
				<div className='modal-overlay'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h2 className='modal-title'>Create New Subject (General)</h2>
							<button
								className='close-button'
								onClick={() => setIsModalOpen(false)}>
								<X size={24} />
							</button>
						</div>

						{error && (
							<div className='error-message'>
								<AlertCircle size={18} /> {error}
							</div>
						)}

						<form onSubmit={handleCreateSubject}>
							<div className='form-group'>
								<label htmlFor='name'>Subject Name</label>
								<input
									id='name'
									type='text'
									value={subjectName}
									onChange={(e) => setSubjectName(e.target.value)}
									className='form-input'
									placeholder='e.g., Mathematics, History'
									required
								/>
							</div>

							<div className='form-group'>
								<label htmlFor='description'>Description (Optional)</label>
								<textarea
									id='description'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className='form-input'
									placeholder='A brief overview of the subject curriculum.'
								/>
							</div>

							<button
								type='submit'
								disabled={creatingSubject}
								className='form-submit-button'>
								{creatingSubject ? (
									<Loader2 className='spinner' size={20} />
								) : (
									'Create Subject'
								)}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
