import { z } from 'zod';

export const SchoolTypeValues = {
	PRIMARY: 'PRIMARY',
	SECONDARY: 'SECONDARY',
	COLLEGE: 'COLLEGE',
	UNIVERSITY: 'UNIVERSITY',
	OTHER: 'OTHER',
} as const;

export type SchoolType =
	(typeof SchoolTypeValues)[keyof typeof SchoolTypeValues];

export const SchoolCategoryValues = {
	PUBLIC: 'PUBLIC',
	PRIVATE: 'PRIVATE',
	RELIGIOUS: 'RELIGIOUS',
	OTHER: 'OTHER',
} as const;

export type SchoolCategory =
	(typeof SchoolCategoryValues)[keyof typeof SchoolCategoryValues];

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.max(32, 'Password must not exceed 32 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(/[@$!%*?&]/, 'Password must contain at least one special character');

export const step1Schema = z.object({
	schoolName: z.string().min(3, 'Required'),
	schoolType: z.enum(Object.values(SchoolTypeValues) as [string, ...string[]]), // Use the constant object
	schoolCategory: z.enum(
		Object.values(SchoolCategoryValues) as [string, ...string[]]
	), // Use the constant object
	registrationNumber: z.string().optional(),
});

export const step2Schema = z.object({
	address: z.string().min(5, 'Required'),
	country: z.string().min(2, 'Required'),
	state: z.string().min(2, 'Required'),
	city: z.string().min(2, 'Required'),
	schoolEmail: z.string().email('Invalid email address'),
	schoolPassword: passwordSchema,
	schoolPhone: z.string().optional(),
	logoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

export const step3Schema = z
	.object({
		firstName: z.string().min(2, 'Required'),
		lastName: z.string().min(2, 'Required'),
		position: z.string().min(2, 'Required'),
		adminEmail: z.string().email('Invalid email address'),
		adminPhone: z.string().optional(),
		password: passwordSchema,
		confirmPassword: passwordSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const onboardSchema = step1Schema
	.merge(step2Schema)
	.merge(step3Schema.omit({ confirmPassword: true }));

export const fullOnboardSchema = step1Schema
	.merge(step2Schema)
	.merge(step3Schema);

export type OnboardSchoolDto = z.infer<typeof onboardSchema>;
export type FullOnboardFormData = z.infer<typeof fullOnboardSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string(),
});
export type LoginDto = z.infer<typeof loginSchema>;

export interface AdministrativeSummaryDto {
	totalClasses: number;
	totalStudents: number;
	totalTeachers: number;
	totalAdmins: number;
	totalParents: number;
}

export interface AttendanceMetricsDto {
	totalRecordedAttendanceSessions: number;
	totalPresent: number;
	totalAbsentOrTardy: number;
	schoolAverageAttendanceRate: number;
}

export interface GradingMetricsDto {
	totalAssignmentsCreated: number;
	totalSubmissionsGraded: number;
	overallSchoolAverageGrade: number;
}

export interface PerformanceSummaryDto {
	attendance: AttendanceMetricsDto;
	grading: GradingMetricsDto;
}

export interface ClassBreakdownDto {
	classId: string;
	className: string;
	studentCount: number;
}

export interface SchoolAnalyticsResponseDto {
	schoolId: string;
	schoolName: string;
	administrativeSummary: AdministrativeSummaryDto;
	performanceSummary: PerformanceSummaryDto;
	classes: ClassBreakdownDto[];
}
