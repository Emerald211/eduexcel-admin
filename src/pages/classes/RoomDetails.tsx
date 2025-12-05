import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
	useGetRoomsQuery,
	useUpdateRoomMutation,
	useDeleteRoomMutation,
	type UpdateRoomDto,
} from '../../services/authApi';
import {
	ArrowLeft,
	Edit2,
	Trash2,
	Save,
	X,
	Home,
	Users,
	Loader2,
} from 'lucide-react';
import './ClassesAndRoom.css';

export default function RoomDetails() {
	const { roomId } = useParams<{ roomId: string }>();
	const navigate = useNavigate();
	const { user } = useSelector((state: RootState) => state.auth);
	const [isEditing, setIsEditing] = useState(false);

	// Use undefined as the argument for the list query, relying on skip logic
	const { data: rooms = [] } = useGetRoomsQuery(undefined, {
		skip: !user?.schoolId,
	});

	const [updateRoom, { isLoading: updating }] = useUpdateRoomMutation();
	const [deleteRoom, { isLoading: deleting }] = useDeleteRoomMutation();

	const roomData = rooms.find((r) => r.id === roomId);

	// Initialize state with data if found, or defaults
	const [formData, setFormData] = useState<UpdateRoomDto>({
		name: roomData?.name || '',
		type: roomData?.type || 'classroom',
		capacity: roomData?.capacity || undefined,
	});

	// FIX: Use useEffect to synchronize formData with roomData when not editing
	useEffect(() => {
		if (roomData && !isEditing) {
			setFormData({
				name: roomData.name,
				type: roomData.type,
				capacity: roomData.capacity || undefined,
			});
		}
	}, [roomData, isEditing]);

	if (!roomData) {
		// Show loading state if we are still waiting for data and not skipped
		if (!user?.schoolId) {
			return (
				<div className='classes-rooms-container'>
					<div className='empty-state'>
						<Loader2 className='spinner' size={48} />
						<h3 className='empty-title'>Authenticating...</h3>
					</div>
				</div>
			);
		}

		if (rooms.length === 0) {
			return (
				<div className='classes-rooms-container'>
					<div className='empty-state'>
						<Loader2 className='spinner' size={48} />
						<h3 className='empty-title'>Loading room details...</h3>
					</div>
				</div>
			);
		}

		return (
			<div className='classes-rooms-container'>
				<div className='empty-state'>
					<Home className='empty-icon' size={48} />
					<h3 className='empty-title'>Room not found</h3>
					<button
						onClick={() => navigate('/dashboard/classes')}
						className='empty-action-button'>
						Back to Rooms
					</button>
				</div>
			</div>
		);
	}

	const handleUpdate = async () => {
		try {
			if (!roomId) return;
			await updateRoom({ id: roomId, data: formData }).unwrap();
			setIsEditing(false);
		} catch (error) {
			console.error('Failed to update room:', error);
		}
	};

	const handleDelete = async () => {
		// NOTE: In a production app, use a custom modal for confirmation.
		if (window.confirm(`Are you sure you want to delete ${roomData.name}?`)) {
			try {
				if (!roomId) return;
				await deleteRoom(roomId).unwrap();
				navigate('/dashboard/classes');
			} catch (error) {
				console.error('Failed to delete room:', error);
			}
		}
	};

	const handleCancel = () => {
		// Revert form data to the current roomData
		setFormData({
			name: roomData.name,
			type: roomData.type,
			capacity: roomData.capacity || undefined,
		});
		setIsEditing(false);
	};

	return (
		<div className='classes-rooms-container'>
			<div className='details-header'>
				<button
					onClick={() => navigate('/dashboard/classes')}
					className='back-button'>
					<ArrowLeft size={20} />
					Back to Rooms
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
							<label className='form-label'>Room Name</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className='form-input'
								placeholder='e.g., Music Room'
							/>
						</div>
						<div className='form-group'>
							<label className='form-label'>Room Type</label>
							<select
								value={formData.type}
								onChange={(e) =>
									setFormData({ ...formData, type: e.target.value })
								}
								className='form-select'>
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
								value={formData.capacity ?? ''}
								onChange={(e) =>
									setFormData({
										...formData,
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
					</div>
				) : (
					<div className='details-content'>
						<div className='detail-section'>
							<h2 className='detail-title'>{roomData.name}</h2>
						</div>

						<div className='detail-grid'>
							<div className='detail-item'>
								<div className='detail-icon'>
									<Home size={20} />
								</div>
								<div>
									<p className='detail-label'>Room Type</p>
									<p className='detail-value capitalize'>{roomData.type}</p>
								</div>
							</div>

							{roomData.capacity !== undefined && ( // Check explicitly for not undefined
								<div className='detail-item'>
									<div className='detail-icon'>
										<Users size={20} />
									</div>
									<div>
										<p className='detail-label'>Capacity</p>
										<p className='detail-value'>{roomData.capacity} people</p>
									</div>
								</div>
							)}

							{/* Add section for Assigned Classes if roomData included that information */}
							<div className='detail-item detail-full-width'>
								{/* Placeholder for future implementation of showing assigned classes */}
								<p className='detail-label'>Assigned Classes</p>
								<p className='detail-value'>-- Feature Coming Soon --</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
