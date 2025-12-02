import {
	Box,
	FormControl,
	FormLabel,
	Input,
	Select,
	FormErrorMessage,
} from '@chakra-ui/react';
import { SchoolCategoryValues, type Step1Data, SchoolTypeValues } from '../../types/dtos';

import { useFormContext } from 'react-hook-form';

export const Step1Profile = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<Step1Data>();

	return (
		<Box>
			<FormControl id='schoolName' isInvalid={!!errors.schoolName} mb={4}>
				<FormLabel>Name of your School</FormLabel>
				<Input
					placeholder='Eduexcel International School'
					{...register('schoolName')}
				/>
				<FormErrorMessage>{errors.schoolName?.message}</FormErrorMessage>
			</FormControl>

			<FormControl id='schoolType' isInvalid={!!errors.schoolType} mb={4}>
				<FormLabel>School Type</FormLabel>
				<Select placeholder='Select type' {...register('schoolType')}>
					{Object.values(SchoolTypeValues).map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</Select>
				<FormErrorMessage>{errors.schoolType?.message}</FormErrorMessage>
			</FormControl>

			<FormControl
				id='schoolCategory'
				isInvalid={!!errors.schoolCategory}
				mb={4}>
				<FormLabel>School Category</FormLabel>
				<Select placeholder='Select category' {...register('schoolCategory')}>
					{Object.values(SchoolCategoryValues).map((category) => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</Select>
				<FormErrorMessage>{errors.schoolCategory?.message}</FormErrorMessage>
			</FormControl>

			<FormControl
				id='registrationNumber'
				isInvalid={!!errors.registrationNumber}
				mb={4}>
				<FormLabel>Accreditation / Registration Number</FormLabel>
				<Input placeholder='NG-MOE-12345' {...register('registrationNumber')} />
				<FormErrorMessage>
					{errors.registrationNumber?.message}
				</FormErrorMessage>
			</FormControl>
		</Box>
	);
};
