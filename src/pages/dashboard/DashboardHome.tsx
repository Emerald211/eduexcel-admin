import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetSchoolAnalyticsQuery } from '@/services/authApi';
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { Users, GraduationCap, AlertCircle, UserCheck } from 'lucide-react';
import './Dashboard.css';

const performanceData = [
	{ month: 'Jan', thisWeek: 45, lastWeek: 40 },
	{ month: 'Feb', thisWeek: 52, lastWeek: 48 },
	{ month: 'Mar', thisWeek: 75, lastWeek: 65 },
	{ month: 'Apr', thisWeek: 68, lastWeek: 58 },
	{ month: 'May', thisWeek: 45, lastWeek: 40 },
	{ month: 'Jun', thisWeek: 38, lastWeek: 35 },
	{ month: 'Jul', thisWeek: 65, lastWeek: 55 },
	{ month: 'Aug', thisWeek: 58, lastWeek: 50 },
	{ month: 'Sep', thisWeek: 42, lastWeek: 38 },
	{ month: 'Oct', thisWeek: 68, lastWeek: 60 },
	{ month: 'Nov', thisWeek: 72, lastWeek: 65 },
	{ month: 'Dec', thisWeek: 55, lastWeek: 48 },
];

const financeData = [
	{ day: 'Mo', thisWeek: 6, lastWeek: 4 },
	{ day: 'Tu', thisWeek: 8, lastWeek: 6 },
	{ day: 'We', thisWeek: 5, lastWeek: 7 },
	{ day: 'Th', thisWeek: 7, lastWeek: 5 },
	{ day: 'F', thisWeek: 9, lastWeek: 8 },
	{ day: 'Sa', thisWeek: 4, lastWeek: 6 },
	{ day: 'Su', thisWeek: 3, lastWeek: 4 },
];

const Calendar = () => {
	const daysInMonth = new Date(2025, 3, 0).getDate();
	const firstDay = new Date(2025, 2, 1).getDay();

	const days = [];
	for (let i = 0; i < firstDay; i++) {
		days.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i);
	}

	return (
		<div className='calendar-container'>
			<h3 className='calendar-header'>March 2025</h3>
			<div className='calendar-grid'>
				{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
					<div key={day} className='calendar-day-header'>
						{day}
					</div>
				))}
				{days.map((day, idx) => {
					if (!day)
						return <div key={`empty-${idx}`} className='calendar-day empty' />;
					const highlightClass =
						day === 8
							? 'highlighted-purple'
							: day === 20
							? 'highlighted-yellow'
							: day === 23
							? 'highlighted-pink'
							: '';

					return (
						<button key={day} className={`calendar-day ${highlightClass}`}>
							{day}
						</button>
					);
				})}
			</div>
		</div>
	);
};

const StatCardSkeleton = () => (
	<div className='card'>
		<div className='stat-card animate-pulse'>
			<div className='stat-icon bg-gray-200' />
			<div className='stat-info'>
				<div className='h-4 bg-gray-200 rounded w-20 mb-2' />
				<div className='h-6 bg-gray-200 rounded w-12' />
			</div>
		</div>
	</div>
);

const ErrorMessage = ({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) => (
	<div className='card col-span-full'>
		<div className='p-6 flex flex-col items-center justify-center gap-4'>
			<AlertCircle className='text-red-500' size={48} />
			<p className='text-red-600 text-center'>{message}</p>
			<button
				onClick={onRetry}
				className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
				Retry
			</button>
		</div>
	</div>
);

export default function DashboardHome() {
	const { user } = useSelector((state: RootState) => state.auth);

	const {
		data: analytics,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetSchoolAnalyticsQuery(user?.schoolId || '', {
		skip: !user?.schoolId,
	});

	return (
		<main className='content'>
			{/* Stats Grid */}
			<div className='stats-grid'>
				{isLoading ? (
					<>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</>
				) : isError ? (
					<ErrorMessage
						message={
							'error' in error ? error.error : 'Failed to load analytics data'
						}
						onRetry={refetch}
					/>
				) : (
					<>
						<div className='card'>
							<div className='stat-card'>
								<div className='stat-icon students'>
									<Users style={{ width: 24, height: 24 }} />
								</div>
								<div className='stat-info'>
									<p>Students</p>
									<p>{analytics?.administrativeSummary.totalStudents || 0}</p>
								</div>
							</div>
						</div>

						<div className='card'>
							<div className='stat-card'>
								<div className='stat-icon teachers'>
									<GraduationCap style={{ width: 24, height: 24 }} />
								</div>
								<div className='stat-info'>
									<p>Teachers</p>
									<p>{analytics?.administrativeSummary.totalTeachers || 0}</p>
								</div>
							</div>
						</div>

						<div className='card'>
							<div className='stat-card'>
								<div className='stat-icon' style={{ background: '#10b981' }}>
									<UserCheck style={{ width: 24, height: 24 }} />
								</div>
								<div className='stat-info'>
									<p>Parents</p>
									<p>{analytics?.administrativeSummary.totalParents || 0}</p>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			{/* School Performance Chart */}
			<div className='card'>
				<div className='chart-card'>
					<div className='chart-header'>
						<h2 className='chart-title'>School Performance</h2>
						<div className='chart-legend'>
							<div className='legend-item'>
								<div className='legend-dot yellow' />
								<span className='legend-label'>This Week</span>
								<span className='legend-value'>1,245</span>
							</div>
							<div className='legend-item'>
								<div className='legend-dot orange' />
								<span className='legend-label'>Last Week</span>
								<span className='legend-value'>1,356</span>
							</div>
						</div>
					</div>
					<ResponsiveContainer width='100%' height={300}>
						<LineChart data={performanceData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
							<XAxis dataKey='month' />
							<YAxis />
							<Tooltip />
							<Line
								type='monotone'
								dataKey='thisWeek'
								stroke='#facc15'
								strokeWidth={3}
								dot={{ fill: '#facc15', r: 4 }}
							/>
							<Line
								type='monotone'
								dataKey='lastWeek'
								stroke='#fb923c'
								strokeWidth={3}
								dot={{ fill: '#fb923c', r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Bottom Section - Calendar and Finance */}
			<div className='bottom-grid'>
				<div className='card'>
					<div className='chart-card'>
						<h2 className='chart-title'>School Calendar</h2>
						<Calendar />
					</div>
				</div>

				<div className='card'>
					<div className='chart-card'>
						<div className='chart-header'>
							<h2 className='chart-title'>School Finance</h2>
							<div className='chart-legend'>
								<div className='legend-item'>
									<div className='legend-dot yellow' />
									<span className='legend-label'>This Week</span>
									<span className='legend-value'>1,245</span>
								</div>
								<div className='legend-item'>
									<div className='legend-dot orange' />
									<span className='legend-label'>Last Week</span>
									<span className='legend-value'>1,356</span>
								</div>
							</div>
						</div>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={financeData}>
								<CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
								<XAxis dataKey='day' />
								<YAxis />
								<Tooltip />
								<Bar dataKey='thisWeek' fill='#facc15' radius={[8, 8, 0, 0]} />
								<Bar dataKey='lastWeek' fill='#fb923c' radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</main>
	);
}
