import {
	Bell,
	LogOut,
	Settings,
	Users,
	GraduationCap,
	CalendarIcon,
	DollarSign,
	BookIcon,
	LayoutDashboard,
} from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { logout } from '@/slices/authSlice';
import { useGetSchoolAnalyticsQuery } from '@/services/authApi';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css'; // This file is assumed to be present

export default function DashboardLayout() {
	const location = useLocation();
	const { user } = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// FIX: Pass undefined as the argument, relying on skip and the schoolId being available
	// via a custom baseQuery or middleware in authApi.
	const { data: analytics } = useGetSchoolAnalyticsQuery(undefined, {
		skip: !user?.schoolId,
	});

	const handleLogout = () => {
		dispatch(logout());
		navigate('/');
	};

	const navItems = [
		{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }, // Changed to LayoutDashboard icon for main dashboard
		{ name: 'Teachers/Students', icon: Users, path: '/dashboard/teachers' },
		{ name: 'Classes/Rooms', icon: GraduationCap, path: '/dashboard/classes' },
		{ name: 'Subjects', icon: BookIcon, path: '/dashboard/subjects' },
		{ name: 'Events', icon: CalendarIcon, path: '/dashboard/events' },
		{ name: 'Finance', icon: DollarSign, path: '/dashboard/finance' },
		{
			name: 'Settings and profile',
			icon: Settings,
			path: '/dashboard/settings',
		},
	];

	const isActive = (path: string) => {
		if (path === '/dashboard') {
			return location.pathname === '/dashboard';
		}
		return location.pathname.startsWith(path);
	};

	if (!user) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold mb-4'>Please log in</h2>
					<p>You need to be logged in to access the dashboard.</p>
				</div>
			</div>
		);
	}

	// Logic to fix the background image style using url()
	const logoStyle = analytics?.schoolLogo
		? { backgroundImage: `url('${analytics.schoolLogo}')` }
		: {};

	return (
		<div className='dashboard-container'>
			<div className='sidebar'>
				<div className='sidebar-header'>
					{analytics?.schoolLogo ? (
						<div style={logoStyle} className='logo' />
					) : (
						// Fallback icon if logo URL is missing
						<div className='logo logo-fallback'>
							<LayoutDashboard size={28} className='text-indigo-400' />
						</div>
					)}
					<span className='school-name'>
						{analytics?.schoolName || 'Eduexcel'}
					</span>
					{analytics?.schoolId && (
						<h6 className='text-xs text-gray-500 mt-1'>
							ID: {analytics.schoolId}
						</h6>
					)}
				</div>

				<nav className='nav-container'>
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.name}
								onClick={() => navigate(item.path)}
								className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
								<Icon className='nav-icon' />
								<span>{item.name}</span>
							</button>
						);
					})}
				</nav>

				<div className='sidebar-footer'>
					<div className='badges-container'>
						<span className='badge badge-features'>Features</span>
						<span className='badge badge-new'>NEW</span>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className='main-content'>
				<header className='header'>
					<div>
						<h1>Welcome to the Admin dashboard, {user.firstName}</h1>
					</div>
					<div className='header-actions'>
						<button className='bell-btn'>
							<Bell style={{ width: 20, height: 20 }} />
							<span className='notification-dot' />
						</button>
						<button onClick={handleLogout} className='logout-btn'>
							<LogOut style={{ width: 16, height: 16 }} />
							Log out
						</button>
					</div>
				</header>

				{/* Child routes will render here */}
				<Outlet />
			</div>
		</div>
	);
}
