import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
	useGetClassesQuery,
	useUpdateClassMutation,
	useDeleteClassMutation,
	useGetRoomsQuery,
	type UpdateClassDto,
} from '../../services/authApi';
import {
	ArrowLeft,
	Edit2,
	Trash2,
	Save,
	X,
	Home,
	Users,
	BookOpen,
	Loader2,
	UserCheck,
} from 'lucide-react';
import './ClassesAndRoom.css';

// Component structure remains the same
export default function ClassDetails() {
	const { classId } = useParams<{ classId: string }>();
	const navigate = useNavigate();
	const { user } = useSelector((state: RootState) => state.auth);
	const [isEditing, setIsEditing] = useState(false);

	const skipQuery = !user?.schoolId;

	// FIX 1: Argument changed from `user?.schoolId || ''` to `undefined`
	const { data: classes = [] } = useGetClassesQuery(undefined, {
		skip: skipQuery,
	});

	// FIX 2: Argument changed from `user?.schoolId || ''` to `undefined`
	const { data: rooms = [] } = useGetRoomsQuery(undefined, {
		skip: skipQuery,
	});

	const [updateClass, { isLoading: updating }] = useUpdateClassMutation();
	const [deleteClass, { isLoading: deleting }] = useDeleteClassMutation();

	const classData = classes.find((c) => c.id === classId);

	// Initialize state with data if found, otherwise with empty defaults
	const [formData, setFormData] = useState<UpdateClassDto>({
		name: classData?.name || '',
		gradeLevel: classData?.gradeLevel || '',
		roomAssignmentId: classData?.roomAssignmentId || undefined,
	});

	if (!classData) {
		// If the ID is invalid or data is still loading (and not skipped)
		if (!skipQuery && classes.length === 0) {
			return (
				<div className='classes-rooms-container'>
					<div className='empty-state'>
						<Loader2 className='spinner' size={48} />
						<h3 className='empty-title'>Loading class details...</h3>
					</div>
				</div>
			);
		}
		return (
			<div className='classes-rooms-container'>
				<div className='empty-state'>
					<BookOpen className='empty-icon' size={48} />
					<h3 className='empty-title'>Class not found</h3>
					<button
						onClick={() => navigate('/dashboard/classes')}
						className='empty-action-button'>
						Back to Classes
					</button>
				</div>
			</div>
		);
	}

	const handleUpdate = async () => {
		try {
			// Ensure classId is valid before proceeding
			if (!classId) return;

			await updateClass({ id: classId, data: formData }).unwrap();
			setIsEditing(false);
		} catch (error) {
			console.error('Failed to update class:', error);
		}
	};

	const handleDelete = async () => {
		// IMPORTANT: Replacing window.confirm() with a custom modal prompt in a real app is best practice.
		// For this environment, I'm keeping the original pattern, but noting the anti-pattern.
		// If I was generating this from scratch, I'd use a custom modal UI.
		if (window.confirm(`Are you sure you want to delete ${classData.name}?`)) {
			try {
				if (!classId) return;
				await deleteClass(classId).unwrap();
				navigate('/dashboard/classes');
			} catch (error) {
				console.error('Failed to delete class:', error);
			}
		}
	};

	const handleCancel = () => {
		setFormData({
			name: classData.name,
			gradeLevel: classData.gradeLevel,
			roomAssignmentId: classData.roomAssignmentId || undefined,
		});
		setIsEditing(false);
	};

	// --- Logic for Displaying Data ---
	const studentsCount = classData.studentsEnrolled ?? 0;

	// Check if teacherNames is a non-empty string, otherwise display a fallback
	const teacherDisplay = classData.teacherNames
		? classData.teacherNames
				.split(',')
				.map((name) => name.trim())
				.join(', ') // Format the string
		: 'None'; // Fallback text when empty/missing

	// If teacherDisplay is 'Not Assigned', we use 0 to indicate 0 teachers if that's what the backend provides
	const teachersCount = classData.teacherNames
		? classData.teacherNames.split(',').length
		: 0;

	return (
		<div className='classes-rooms-container'>
			<div className='details-header'>
				<button
					onClick={() => navigate('/dashboard/classes')}
					className='back-button'>
					<ArrowLeft size={20} />
					Back to Classes
				</button>
				<div className='details-actions'>
					{isEditing ? (
						<>
							<button
								onClick={handleCancel}
								className='icon-button-large cancel'>
								<X size={20} />
								Cancel
							</button>
							<button
								onClick={handleUpdate}
								disabled={updating}
								className='icon-button-large save'>
								{updating ? (
									<Loader2 className='spinner' size={20} />
								) : (
									<Save size={20} />
								)}
								Save
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => setIsEditing(true)}
								className='icon-button-large edit'>
								<Edit2 size={20} />
								Edit
							</button>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className='icon-button-large delete'>
								{deleting ? (
									<Loader2 className='spinner' size={20} />
								) : (
									<Trash2 size={20} />
								)}
								Delete
							</button>
						</>
					)}
				</div>
			</div>

			<div className='details-card'>
				{isEditing ? (
					<div className='form-container'>
						<div className='form-group'>
							<label className='form-label'>Class Name</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className='form-input'
								placeholder='e.g., Primary 1A'
							/>
						</div>
						<div className='form-group'>
							<label className='form-label'>Grade Level</label>
							<input
								type='text'
								value={formData.gradeLevel}
								onChange={(e) =>
									setFormData({ ...formData, gradeLevel: e.target.value })
								}
								className='form-input'
								placeholder='e.g., Grade 1, JSS 1, SSS 2'
							/>
						</div>
						<div className='form-group'>
							<label className='form-label'>Room Assignment</label>
							<select
								value={formData.roomAssignmentId || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										roomAssignmentId: e.target.value || undefined,
									})
								}
								className='form-select'>
								<option value=''>No room assigned</option>
								{rooms.map((room) => (
									<option key={room.id} value={room.id}>
										{room.name} ({room.type})
									</option>
								))}
							</select>
						</div>
					</div>
				) : (
					<div className='details-content'>
						<div className='detail-section'>
							<h2 className='detail-title'>{classData.name}</h2>
						</div>

						<div className='detail-grid'>
							{/* Grade Level */}
							<div className='detail-item'>
								<div className='detail-icon'>
									<BookOpen size={20} />
								</div>
								<div>
									<p className='detail-label'>Grade Level</p>
									<p className='detail-value'>{classData.gradeLevel}</p>
								</div>
							</div>

							{/* Assigned Room */}
							{classData.roomAssignmentId && (
								<div className='detail-item'>
									<div className='detail-icon'>
										<Home size={20} />
									</div>
									<div>
										<p className='detail-label'>Assigned Room</p>
										<p className='detail-value'>
											{classData.roomName || 'Room Assigned'}
										</p>
									</div>
								</div>
							)}

							{/* Students Enrolled (Fixed Display Logic) */}
							<div className='detail-item'>
								<div className='detail-icon'>
									<Users size={20} />
								</div>
								<div>
									<p className='detail-label'>Students Enrolled</p>
									<p className='detail-value'>{studentsCount}</p>
								</div>
							</div>

							{/* Teachers (Fixed Display Logic) */}
							<div className='detail-item detail-full-width'>
								<div className='detail-icon'>
									<UserCheck size={20} />{' '}
									{/* Using a slightly different icon for clarity */}
								</div>
								<div>
									<p className='detail-label'>
										Assigned Teachers ({teachersCount})
									</p>
									{/* Displaying names clearly or the fallback text */}
									<p className='detail-value detail-value-names'>
										{teacherDisplay}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
