import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store/store';
import {
	useGetClassesQuery,
	useCreateClassMutation,
	useGetRoomsQuery,
	useCreateRoomMutation,
	type CreateClassDto,
	type CreateRoomDto,
} from '../../services/authApi';
import { Plus, X, Home, BookOpen, Loader2, ChevronRight } from 'lucide-react';
import './ClassesAndRoom.css';

type TabType = 'classes' | 'rooms';

export default function ClassesAndRooms() {
	const { user } = useSelector((state: RootState) => state.auth);
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabType>('classes');
	const [showClassModal, setShowClassModal] = useState(false);
	const [showRoomModal, setShowRoomModal] = useState(false);

	const [classForm, setClassForm] = useState<Omit<CreateClassDto, 'schoolId'>>({
		name: '',
		gradeLevel: '',
		roomAssignmentId: undefined,
	});

	const [roomForm, setRoomForm] = useState<Omit<CreateRoomDto, 'schoolId'>>({
		name: '',
		type: 'classroom',
		capacity: undefined,
	});

	const skipQuery = !user?.schoolId;

	// FIX 1: Argument changed from `user?.schoolId || ''` to `undefined`
	const { data: classes = [], isLoading: loadingClasses } = useGetClassesQuery(
		undefined,
		{ skip: skipQuery } // Using skipQuery variable
	);

	console.log(classes);

	// FIX 2: Argument changed from `user?.schoolId || ''` to `undefined`
	const { data: rooms = [], isLoading: loadingRooms } = useGetRoomsQuery(
		undefined,
		{ skip: skipQuery } // Using skipQuery variable
	);

	const [createClass, { isLoading: creatingClass }] = useCreateClassMutation();
	const [createRoom, { isLoading: creatingRoom }] = useCreateRoomMutation();

	const handleClassClick = (classId: string) => {
		navigate(`/dashboard/classes/${classId}`);
	};

	const handleRoomClick = (roomId: string) => {
		navigate(`/dashboard/rooms/${roomId}`);
	};

	const handleCreateClass = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createClass({ ...classForm }).unwrap();
			setShowClassModal(false);
			resetClassForm();
		} catch (error) {
			console.error('Failed to create class:', error);
		}
	};

	const handleCreateRoom = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createRoom({
				...roomForm,
				schoolId: user?.schoolId || '',
			}).unwrap();
			setShowRoomModal(false);
			resetRoomForm();
		} catch (error) {
			console.error('Failed to create room:', error);
		}
	};

	const resetClassForm = () => {
		setClassForm({
			name: '',
			gradeLevel: '',
			roomAssignmentId: undefined,
		});
	};

	const resetRoomForm = () => {
		setRoomForm({
			name: '',
			type: 'classroom',
			capacity: undefined,
		});
	};

	const closeClassModal = () => {
		setShowClassModal(false);
		resetClassForm();
	};

	const closeRoomModal = () => {
		setShowRoomModal(false);
		resetRoomForm();
	};

	return (
		<div className='classes-rooms-container'>
			<div className='page-header'>
				<h1 className='page-title'>Classes & Rooms Management</h1>
				<p className='page-subtitle'>
					Manage your school's classes and facilities
				</p>
			</div>

			<div className='tabs-container'>
				<button
					onClick={() => setActiveTab('classes')}
					className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`}>
					<BookOpen size={20} />
					Classes
				</button>
				<button
					onClick={() => setActiveTab('rooms')}
					className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}>
					<Home size={20} />
					Rooms
				</button>
			</div>

			{activeTab === 'classes' && (
				<div>
					<div className='section-header'>
						<h2 className='section-title'>Classes</h2>
						<button
							onClick={() => setShowClassModal(true)}
							className='add-button'>
							<Plus size={20} />
							Add New Class
						</button>
					</div>

					{loadingClasses ? (
						<div className='loading-container'>
							<Loader2 className='spinner' size={40} />
						</div>
					) : classes.length === 0 ? (
						<div className='empty-state'>
							<BookOpen className='empty-icon' size={48} />
							<h3 className='empty-title'>No classes yet</h3>
							<p className='empty-description'>
								Get started by adding your first class
							</p>
							<button
								onClick={() => setShowClassModal(true)}
								className='empty-action-button'>
								Add Class
							</button>
						</div>
					) : (
						<div className='items-grid'>
							{classes.map((cls) => (
								<div
									key={cls.id}
									className='item-card item-card-clickable'
									onClick={() => handleClassClick(cls.id)}>
									<div className='item-card-content'>
										<h3>{cls.name}</h3>
										<ChevronRight className='chevron-icon' size={20} />
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{activeTab === 'rooms' && (
				<div>
					<div className='section-header'>
						<h2 className='section-title'>Rooms</h2>
						<button
							onClick={() => setShowRoomModal(true)}
							className='add-button'>
							<Plus size={20} />
							Add New Room
						</button>
					</div>

					{loadingRooms ? (
						<div className='loading-container'>
							<Loader2 className='spinner' size={40} />
						</div>
					) : rooms.length === 0 ? (
						<div className='empty-state'>
							<Home className='empty-icon' size={48} />
							<h3 className='empty-title'>No rooms yet</h3>
							<p className='empty-description'>
								Get started by adding your first room
							</p>
							<button
								onClick={() => setShowRoomModal(true)}
								className='empty-action-button'>
								Add Room
							</button>
						</div>
					) : (
						<div className='items-grid'>
							{rooms.map((room) => (
								<div
									key={room.id}
									className='item-card item-card-clickable'
									onClick={() => handleRoomClick(room.id)}>
									<div className='item-card-content'>
										<h3>{room.name}</h3>
										<ChevronRight className='chevron-icon' size={20} />
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Modals remain the same - just for creating new items */}
			{showClassModal && (
				<div className='modal-overlay'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h2 className='modal-title'>Add New Class</h2>
							<button onClick={closeClassModal} className='modal-close'>
								<X size={24} />
							</button>
						</div>
						<form onSubmit={handleCreateClass}>
							<div className='form-container'>
								<div className='form-group'>
									<label className='form-label'>Grade Level</label>
									<input
										type='text'
										value={classForm.gradeLevel}
										onChange={(e) =>
											setClassForm({ ...classForm, gradeLevel: e.target.value })
										}
										className='form-input'
										placeholder='e.g., Grade 1, JSS 1, SSS 2'
										required
									/>
								</div>
								<div className='form-group'>
									<label className='form-label'>Class Name</label>
									<input
										type='text'
										value={classForm.name}
										onChange={(e) =>
											setClassForm({ ...classForm, name: e.target.value })
										}
										className='form-input'
										placeholder='e.g., Primary 1A'
										required
									/>
								</div>

								<div className='form-group'>
									<label className='form-label'>
										Room Assignment (Optional)
									</label>
									<select
										value={classForm.roomAssignmentId || ''}
										onChange={(e) =>
											setClassForm({
												...classForm,
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
									<p className='form-helper-text'>
										Assign this class to a specific room
									</p>
								</div>
								<div className='form-actions'>
									<button
										type='button'
										onClick={closeClassModal}
										className='form-button cancel'>
										Cancel
									</button>
									<button
										type='submit'
										disabled={creatingClass}
										className='form-button submit'>
										{creatingClass ? (
											<Loader2 className='spinner' size={20} />
										) : (
											'Create Class'
										)}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}

			{showRoomModal && (
				<div className='modal-overlay'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h2 className='modal-title'>Add New Room</h2>
							<button onClick={closeRoomModal} className='modal-close'>
								<X size={24} />
							</button>
						</div>
						<form onSubmit={handleCreateRoom}>
							<div className='form-container'>
								<div className='form-group'>
									<label className='form-label'>Room Name</label>
									<input
										type='text'
										value={roomForm.name}
										onChange={(e) =>
											setRoomForm({ ...roomForm, name: e.target.value })
										}
										className='form-input'
										placeholder='e.g., Music Room'
										required
									/>
								</div>
								<div className='form-group'>
									<label className='form-label'>Room Type</label>
									<select
										value={roomForm.type}
										onChange={(e) =>
											setRoomForm({ ...roomForm, type: e.target.value })
										}
										className='form-select'
										required>
										<option value='classroom'>Classroom</option>
										<option value='laboratory'>Laboratory</option>
										<option value='library'>Library</option>
										<option value='music'>Music Room</option>
										<option value='art'>Art Room</option>
										<option value='ict'>ICT Room</option>
										<option value='sports'>Sports Hall</option>
										<option value='other'>Other</option>
									</select>
								</div>
								<div className='form-group'>
									<label className='form-label'>Capacity (Optional)</label>
									<input
										type='number'
										value={roomForm.capacity ?? ''}
										onChange={(e) =>
											setRoomForm({
												...roomForm,
												capacity: e.target.value
													? Number(e.target.value)
													: undefined,
											})
										}
										className='form-input'
										placeholder='e.g., 30'
										min='1'
									/>
								</div>
								<div className='form-actions'>
									<button
										type='button'
										onClick={closeRoomModal}
										className='form-button cancel'>
										Cancel
									</button>
									<button
										type='submit'
										disabled={creatingRoom}
										className='form-button submit'>
										{creatingRoom ? (
											<Loader2 className='spinner' size={20} />
										) : (
											'Create Room'
										)}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
