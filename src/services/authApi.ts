import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/store';
import type { OnboardSchoolDto, LoginDto } from '../types/dtos';

// Auth Interfaces
export interface UserInterface {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    position: string;
    schoolId: string;
}

export interface SchoolInterface {
    id: string;
    name: string;
    email: string;
    type: string;
    category: string;
}

export interface AuthResponse {
    user: UserInterface;
    school: SchoolInterface;
    token: string;
}

// Class Interfaces
export interface ClassInterface {
    id: string;
    name: string;
    gradeLevel: string;
    roomAssignmentId?: string;
    studentsEnrolled: number;
    teacherNames: string;
    roomName?: string;
    schoolId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClassDto {
    name: string;
    gradeLevel: string;
    roomAssignmentId?: string;
}

export interface UpdateClassDto {
    name?: string;
    gradeLevel?: string;
    roomAssignmentId?: string;
}

// Room Interfaces
export interface RoomInterface {
    id: string;
    name: string;
    type: string;
    capacity?: number;
    schoolId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoomDto {
    name: string;
    type: string;
    capacity?: number;
    schoolId: string;
}

export interface UpdateRoomDto {
    name?: string;
    type?: string;
    capacity?: number;
}

// Analytics Interface
export interface SchoolAnalyticsResponseDto {
    schoolId: string;
    schoolName: string;
    schoolLogo: string;
    administrativeSummary: {
        totalClasses: number;
        totalStudents: number;
        totalTeachers: number;
        totalAdmins: number;
        totalParents: number;
    };
    performanceSummary: {
        attendance: {
            totalRecordedAttendanceSessions: number;
            totalPresent: number;
            totalAbsentOrTardy: number;
            schoolAverageAttendanceRate: number;
        };
        grading: {
            totalAssignmentsCreated: number;
            totalSubmissionsGraded: number;
            overallSchoolAverageGrade: number;
        };
    };
    classes: ClassInterface[];
}

// Teacher Interface
export interface TeacherInterface {
    userId: string;
    profileId: string;
    name: string;
    email: string;
    phoneNumber: string;
    totalClasses: number;
    classes: Array<{
        id: string;
        name: string;
        gradeLevel: string;
        studentsEnrolled: number;
    }>;
}

// Student Interface
export interface StudentInterface {
    userId: string;
    profileId: string;
    name: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    currentGradeLevel: string;
    class: {
        id: string;
        name: string;
        gradeLevel: string;
    } | null;
    parent: {
        parentId: string;
        name: string;
        email: string;
    } | null;
}

// --- DTO for Assignment (Matches NestJS AssignTeacherToSubjectDto) ---
export interface AssignTeacherToSubjectDto {
    classId: string;
    subjectId: string;
    teacherProfileId: string; // IMPORTANT: Must be profileId, not userId
    sessionStartTime?: string;
    sessionEndTime?: string;
    dayOfWeek?: number;
}

// --- Subject Detail Interfaces (Matches NestJS SubjectListItem structure) ---
export interface SubjectAssignmentTeacher {
    userId: string;
    name: string; // Full name
}

export interface SubjectAssignmentClass {
    classId: string;
    className: string;
    teachers: SubjectAssignmentTeacher[];
}

// This is the core Subject Interface used by useGetSubjectsQuery
// *** gradeLevel REMOVED from SubjectInterface ***
export interface SubjectInterface {
    id: string;
    name: string;
    description?: string;
    schoolId: string;
    createdAt: string;
    updatedAt: string;

    // Computed fields from the backend service
    totalClassesTaught: number;
    totalTeachersAssigned: number;
    classes: SubjectAssignmentClass[];
}

// *** gradeLevel REMOVED from CreateSubjectDto ***
export interface CreateSubjectDto {
    name: string;
    description?: string;
}

export interface AssignmentSuccessResponse {
    message: string;
    assignment: {
        id: string;
        class: string;
        subject: string;
        teacher: string;
        gradeLevel: string;
        sessionStartTime: string | null;
        sessionEndTime: string | null;
        dayOfWeek: number | null;
    };
}


export interface CreatedSubjectResult {
    id: string;
    name: string;
    description: string | null;
}

export interface CreateSubjectResponse {
    message: string;
    subject: CreatedSubjectResult;
}

export type EventCategory =
    | 'Holiday'
    | 'Meeting'
    | 'Academic'
    | 'Sports'
    | 'Other';

export interface EventInterface {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    isAllDay: boolean;
    category: EventCategory;
    createdAt: string;
    createdBy: string;
}

export interface CreateEventDto {
    title: string;
    description: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    isAllDay?: boolean;
    category: EventCategory;
}

export interface GetEventsQueryArgs {
    month?: number;
    year?: number;
}

// API Definition
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api/v1/',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: [
        'Analytics',
        'Classes',
        'Rooms',
        'Teachers',
        'Students',
        'Subjects',
        'Events',
    ],
    endpoints: (builder) => ({
        // Auth endpoints
        onboardSchool: builder.mutation<AuthResponse, OnboardSchoolDto>({
            query: (data) => ({
                url: 'auth/onboard-school',
                method: 'POST',
                body: data,
            }),
        }),
        login: builder.mutation<AuthResponse, LoginDto>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),

        // Analytics endpoints
        getSchoolAnalytics: builder.query<SchoolAnalyticsResponseDto, void>({
            query: () => `analytics/school`,
            providesTags: ['Analytics'],
        }),

        // Classes endpoints
        // FIX: Changed argument type from 'string' to 'void'
        getClasses: builder.query<ClassInterface[], void>({
            query: () => `classes/all`,
            providesTags: ['Classes'],
        }),
        createClass: builder.mutation<ClassInterface, CreateClassDto>({
            query: (data) => ({
                url: 'schools/classes',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Classes', 'Analytics'],
        }),
        updateClass: builder.mutation<
            ClassInterface,
            { id: string; data: UpdateClassDto }
        >({
            query: ({ id, data }) => ({
                url: `classes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Classes', 'Analytics'],
        }),
        deleteClass: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `classes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Classes', 'Analytics'],
        }),

        // Rooms endpoints
        // FIX: Changed argument type from 'string' to 'void'
        getRooms: builder.query<RoomInterface[], void>({
            query: () => `rooms/all`,
            providesTags: ['Rooms'],
        }),
        createRoom: builder.mutation<RoomInterface, CreateRoomDto>({
            query: (data) => ({
                url: 'schools/rooms',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Rooms'],
        }),
        updateRoom: builder.mutation<
            RoomInterface,
            { id: string; data: UpdateRoomDto }
        >({
            query: ({ id, data }) => ({
                url: `rooms/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Rooms'],
        }),
        deleteRoom: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `rooms/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Rooms'],
        }),

        // Teachers endpoints
        getTeachers: builder.query<TeacherInterface[], void>({
            query: () => `teachers/all`,
            providesTags: ['Teachers'],
        }),

        // Students endpoints
        getStudents: builder.query<StudentInterface[], void>({
            query: () => `students/all`,
            providesTags: ['Students'],
        }),

        getSubjects: builder.query<SubjectInterface[], void>({
            query: () => `subjects/all`, // Assuming this is the correct backend route
            providesTags: ['Subjects'],
        }),

        createSubject: builder.mutation<CreateSubjectResponse, CreateSubjectDto>({
            query: (data) => ({
                url: 'subjects/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subjects'],
        }),

        assignTeacherToSubject: builder.mutation<
            AssignmentSuccessResponse,
            AssignTeacherToSubjectDto
        >({
            query: (data) => ({
                url: 'subjects/assign-teacher',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subjects', 'Classes'],
        }),

        getSchoolEvents: builder.query<EventInterface[], GetEventsQueryArgs>({
            query: (args) => {
                const params = new URLSearchParams();
                if (args.month) params.append('month', args.month.toString());
                if (args.year) params.append('year', args.year.toString());
                return `events?${params.toString()}`;
            },
            providesTags: ['Events'],
        }),

        createEvent: builder.mutation<EventInterface, CreateEventDto>({
            query: (data) => ({
                url: 'events',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Events'],
        }),
    }),
});

export const {
    useOnboardSchoolMutation,
    useLoginMutation,
    useGetSchoolAnalyticsQuery,
    useGetClassesQuery,
    useCreateClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useGetTeachersQuery,
    useGetStudentsQuery,
    useGetSubjectsQuery,
    useCreateSubjectMutation,
    useAssignTeacherToSubjectMutation,
    useGetSchoolEventsQuery,
    useCreateEventMutation, 
} = api;