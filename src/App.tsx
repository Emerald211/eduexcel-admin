import './App.css';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import OnboardingPage from './pages/Onboarding';
import LoginPage from './pages/Login';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import ClassesAndRooms from './pages/classes/ClassesAndRooms';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ClassDetails from './pages/classes/ClassDetails';
import RoomDetails from './pages/classes/RoomDetails';
import TeachersAndStudents from './pages/teacher-student/TeachersAndStudents';
import TeacherDetails from './pages/teacher-student/TeacherDetails';
import StudentDetails from './pages/teacher-student/StudentDetails';
import Subjects from './pages/subjects/Subjects';
import SubjectDetails from './pages/subjects/SubjectDetails';
import EventsPage from './pages/events/EventPage';

const theme = extendTheme({});

function App() {
	return (
		<ChakraProvider theme={theme}>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<LoginPage />} />
					<Route
						path='/onboarding/create-account'
						element={<OnboardingPage />}
					/>
					<Route element={<ProtectedRoute />}>
						<Route path='/dashboard' element={<DashboardLayout />}>
							<Route index element={<DashboardHome />} />
							<Route path='classes' element={<ClassesAndRooms />} />
							<Route path='classes/:classId' element={<ClassDetails />} />
							<Route path='rooms/:roomId' element={<RoomDetails />} />
							<Route path='teachers' element={<TeachersAndStudents />} />
							<Route
								path='teachers/teacher/:userId'
								element={<TeacherDetails />}
							/>

							<Route
								path='teachers/student/:userId'
								element={<StudentDetails />}
							/>

							<Route path='subjects' element={<Subjects />} />
							<Route path='subjects/:subjectId' element={<SubjectDetails />} />
							<Route path='events' element={<EventsPage />} />
							<Route
								path='finance'
								element={<div>Finance Page Coming Soon</div>}
							/>
							<Route
								path='settings'
								element={<div>Settings Page Coming Soon</div>}
							/>
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</ChakraProvider>
	);
}

export default App;
