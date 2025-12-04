import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
	useGetSchoolEventsQuery,
	useCreateEventMutation,
	type CreateEventDto,
	
	type EventCategory,
} from '@/services/authApi';
import {
	Plus,
	X,
	Calendar,
	Loader2,
	Clock,
	Tag,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import moment from 'moment';
import './EventsPage.css';

// Utility function to format date
const formatDate = (isoString: string, isAllDay: boolean) => {
	if (isAllDay) {
		return moment(isoString).format('ddd, MMM Do YYYY');
	}
	return moment(isoString).format('ddd, MMM Do YYYY @ h:mm A');
};

// Default form state for new event
const defaultCreateEventForm: CreateEventDto = {
	title: '',
	description: '',
	startDate: moment().startOf('day').toISOString(true),
	endDate: moment().endOf('day').toISOString(true),
	isAllDay: true,
	category: 'Academic',
};

// Component to determine the CSS class for an event category
const getCategoryClass = (category: EventCategory) => {
	switch (category) {
		case 'Holiday':
			return 'category-holiday';
		case 'Meeting':
			return 'category-meeting';
		case 'Academic':
			return 'category-academic';
		case 'Sports':
			return 'category-sports';
		case 'Other':
			return 'category-other';
		default:
			return 'category-other';
	}
};

export default function EventsPage() {
	const { user } = useSelector((state: RootState) => state.auth);
	const [showModal, setShowModal] = useState(false);
	const [filterDate, setFilterDate] = useState(new Date());

	const currentMonth = filterDate.getMonth() + 1;
	const currentYear = filterDate.getFullYear();

	const [form, setForm] = useState<CreateEventDto>(defaultCreateEventForm);

	const { data: events = [], isLoading: loadingEvents } =
		useGetSchoolEventsQuery(
			{ month: currentMonth, year: currentYear },
			{ skip: !user?.schoolId }
		);

	const [createEvent, { isLoading: creatingEvent }] = useCreateEventMutation();

	// Handlers for month navigation
	const handlePrevMonth = () => {
		setFilterDate((prev) => moment(prev).subtract(1, 'month').toDate());
	};

	const handleNextMonth = () => {
		setFilterDate((prev) => moment(prev).add(1, 'month').toDate());
	};

	const handleToday = () => {
		setFilterDate(new Date());
	};

	// Memoize the sorted events list
	const sortedEvents = useMemo(() => {
		return [...events].sort(
			(a, b) =>
				new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
		);
	}, [events]);

	// Form input change handler
	const handleFormChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value, type } = e.target;
		if (type === 'checkbox' && name === 'isAllDay') {
			const checked = (e.target as HTMLInputElement).checked;
			setForm((prev) => ({
				...prev,
				isAllDay: checked,
				// Reset dates to start/end of day if switching to all-day
				startDate: checked
					? moment(prev.startDate).startOf('day').toISOString(true)
					: prev.startDate,
				endDate: checked
					? moment(prev.endDate).endOf('day').toISOString(true)
					: prev.endDate,
			}));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	// Date and Time Change Handlers
	const handleDateTimeChange = (
		name: 'startDate' | 'endDate',
		value: string
	) => {
		// If input is a local date/time string, convert to ISO string for backend
		let isoValue = value;
		if (value) {
			// Ensure conversion to ISO string with timezone offset
			const date = moment(value);
			if (date.isValid()) {
				isoValue = date.toISOString(true);
			}
		}

		setForm((prev) => ({ ...prev, [name]: isoValue }));
	};

	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// Ensure the dates are properly set before sending
			const payload: CreateEventDto = {
				...form,
				// The dates are already handled in the input handlers, but trim whitespace just in case
				startDate: form.startDate.trim(),
				endDate: form.endDate.trim(),
				isAllDay: form.isAllDay ?? false, // Ensure boolean safety
			};

			await createEvent(payload).unwrap();
			setShowModal(false);
			setForm(defaultCreateEventForm);
		} catch (error) {
			console.error('Failed to create event:', error);
		}
	};

	// Renders the date/time inputs based on isAllDay state
	const renderDateTimeInputs = () => {
		const isAllDay = form.isAllDay;
		const commonProps = {
			required: true,
			className: 'form-input',
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				handleDateTimeChange(
					e.target.name as 'startDate' | 'endDate',
					e.target.value
				),
		};

		// Helper to format ISO string to local date/time input format (YYYY-MM-DDTHH:mm or YYYY-MM-DD)
		const toLocalInputFormat = (isoString: string) => {
			const m = moment(isoString);
			if (!m.isValid()) return '';

			// If all-day, use YYYY-MM-DD
			if (isAllDay) return m.format('YYYY-MM-DD');

			// If timed event, use YYYY-MM-DDTHH:mm
			return m.local().format('YYYY-MM-DDTHH:mm');
		};

		return (
			<>
				<div className='form-group'>
					<label className='form-label'>
						Start Date {isAllDay ? '' : ' & Time'}
					</label>
					<input
						type={isAllDay ? 'date' : 'datetime-local'}
						name='startDate'
						value={toLocalInputFormat(form.startDate)}
						{...commonProps}
					/>
				</div>
				<div className='form-group'>
					<label className='form-label'>
						End Date {isAllDay ? '' : ' & Time'}
					</label>
					<input
						type={isAllDay ? 'date' : 'datetime-local'}
						name='endDate'
						value={toLocalInputFormat(form.endDate)}
						{...commonProps}
					/>
				</div>
			</>
		);
	};

	return (
		<div className='events-container'>
			<div className='page-header'>
				<h1 className='page-title'>School Events Calendar</h1>
				<p className='page-subtitle'>
					Manage holidays, meetings, and important academic dates
				</p>
			</div>

			<div className='calendar-controls'>
				<div className='date-navigator'>
					<button onClick={handlePrevMonth} className='nav-button'>
						<ChevronLeft size={20} />
					</button>
					<button onClick={handleToday} className='today-button'>
						Today
					</button>
					<button onClick={handleNextMonth} className='nav-button'>
						<ChevronRight size={20} />
					</button>
				</div>
				<h2 className='current-month-title'>
					{moment(filterDate).format('MMMM YYYY')}
				</h2>
				<button onClick={() => setShowModal(true)} className='add-button'>
					<Plus size={20} />
					Add New Event
				</button>
			</div>

			{loadingEvents ? (
				<div className='loading-container'>
					<Loader2 className='spinner' size={40} />
					<p>Loading events...</p>
				</div>
			) : sortedEvents.length === 0 ? (
				<div className='empty-state'>
					<Calendar className='empty-icon' size={48} />
					<h3 className='empty-title'>No events scheduled this month</h3>
					<p className='empty-description'>
						Use the "Add New Event" button to schedule a new activity or
						holiday.
					</p>
					<button
						onClick={() => setShowModal(true)}
						className='empty-action-button'>
						Schedule Event
					</button>
				</div>
			) : (
				<div className='events-list'>
					{sortedEvents.map((event) => (
						<div key={event.id} className='event-card'>
							<div
								className={`event-date-block ${getCategoryClass(
									event.category
								)}`}>
								{moment(event.startDate).format('MMM')}
								<span className='day'>
									{moment(event.startDate).format('D')}
								</span>
								<span className='year'>
									{moment(event.startDate).format('YYYY')}
								</span>
							</div>
							<div className='event-details'>
								<h3 className='event-title'>{event.title}</h3>
								<p className='event-description'>{event.description}</p>
								<div className='event-meta'>
									<span className='event-time'>
										<Clock size={16} />
										{event.isAllDay
											? 'All Day'
											: formatDate(event.startDate, false)}
										{moment(event.startDate).isSame(
											moment(event.endDate),
											'day'
										)
											? ''
											: ' - ' + formatDate(event.endDate, event.isAllDay)}
									</span>
									<span
										className={`event-category-tag ${getCategoryClass(
											event.category
										)}`}>
										<Tag size={16} />
										{event.category}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Event Modal */}
			{showModal && (
				<div className='modal-overlay'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h2 className='modal-title'>Schedule New Event</h2>
							<button
								onClick={() => setShowModal(false)}
								className='modal-close'>
								<X size={24} />
							</button>
						</div>
						<form onSubmit={handleCreateEvent}>
							<div className='form-container'>
								<div className='form-group'>
									<label className='form-label'>Event Title</label>
									<input
										type='text'
										name='title'
										value={form.title}
										onChange={handleFormChange}
										className='form-input'
										placeholder='e.g., Spring Break, Staff Meeting'
										required
									/>
								</div>

								<div className='form-group'>
									<label className='form-label checkbox-label'>
										<input
											type='checkbox'
											name='isAllDay'
											checked={form.isAllDay}
											onChange={handleFormChange}
										/>
										All Day Event
									</label>
								</div>

								<div className='form-date-time-grid'>
									{renderDateTimeInputs()}
								</div>

								<div className='form-group'>
									<label className='form-label'>Category</label>
									<select
										name='category'
										value={form.category}
										onChange={handleFormChange}
										className='form-select'
										required>
										<option value='Academic'>Academic</option>
										<option value='Holiday'>Holiday</option>
										<option value='Meeting'>Meeting / Admin</option>
										<option value='Sports'>Sports</option>
										<option value='Other'>Other</option>
									</select>
								</div>

								<div className='form-group'>
									<label className='form-label'>Description (Optional)</label>
									<textarea
										name='description'
										value={form.description}
										onChange={(e) =>
											setForm({ ...form, description: e.target.value })
										}
										className='form-textarea'
										rows={3}
										placeholder='Brief description of the event.'
									/>
								</div>

								<div className='form-actions'>
									<button
										type='button'
										onClick={() => setShowModal(false)}
										className='form-button cancel'>
										Cancel
									</button>
									<button
										type='submit'
										disabled={creatingEvent}
										className='form-button submit'>
										{creatingEvent ? (
											<Loader2 className='spinner' size={20} />
										) : (
											'Schedule Event'
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
