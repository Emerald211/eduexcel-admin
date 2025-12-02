import {
	Box,
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
	SimpleGrid,
} from '@chakra-ui/react';
import type { Step2Data } from '../../types/dtos';
import { useFormContext } from 'react-hook-form';
import { LogoUploader } from './ui/Logouploader';

export const Step2Location = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<Step2Data>();

	return (
		<Box>
			<FormControl id='address' isInvalid={!!errors.address} mb={4}>
				<FormLabel>Address</FormLabel>
				<Input
					placeholder='123 Adeola Street, Ikeja'
					{...register('address')}
				/>
				<FormErrorMessage>{errors.address?.message}</FormErrorMessage>
			</FormControl>

			<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
				<FormControl id='country' isInvalid={!!errors.country}>
					<FormLabel>Country</FormLabel>
					<Input placeholder='Nigeria' {...register('country')} />
					<FormErrorMessage>{errors.country?.message}</FormErrorMessage>
				</FormControl>

				<FormControl id='state' isInvalid={!!errors.state}>
					<FormLabel>State / Region</FormLabel>
					<Input placeholder='Lagos' {...register('state')} />
					<FormErrorMessage>{errors.state?.message}</FormErrorMessage>
				</FormControl>

				<FormControl id='city' isInvalid={!!errors.city}>
					<FormLabel>City / Town</FormLabel>
					<Input placeholder='Ikeja' {...register('city')} />
					<FormErrorMessage>{errors.city?.message}</FormErrorMessage>
				</FormControl>
			</SimpleGrid>

			<FormControl id='schoolEmail' isInvalid={!!errors.schoolEmail} mb={4}>
				<FormLabel>School Contact Email</FormLabel>
				<Input
					type='email'
					placeholder='contact@greenfield.edu.ng'
					{...register('schoolEmail')}
				/>
				<FormErrorMessage>{errors.schoolEmail?.message}</FormErrorMessage>
			</FormControl>

			<FormControl isInvalid={!!errors.schoolPassword}>
                <FormLabel>School Account Password</FormLabel>
                <Input
                    type='password'
                    placeholder='Enter a strong password for school login'
                    {...register('schoolPassword')} 
                />
                <FormErrorMessage>
                    {errors.schoolPassword && errors.schoolPassword.message}
                </FormErrorMessage>
            </FormControl>

			<FormControl id='schoolPhone' isInvalid={!!errors.schoolPhone} mb={4}>
				<FormLabel>School Phone Number (Optional)</FormLabel>
				<Input placeholder='+234 801 234 5678' {...register('schoolPhone')} />
				<FormErrorMessage>{errors.schoolPhone?.message}</FormErrorMessage>
			</FormControl>

			{/* <FormControl id='logoUrl' isInvalid={!!errors.logoUrl} mb={4}>
				<FormLabel>School Logo URL (Optional)</FormLabel>
				<Input
					placeholder='https://storage.provider.com/logo.png'
					{...register('logoUrl')}
				/>
				<FormErrorMessage>{errors.logoUrl?.message}</FormErrorMessage>
			</FormControl> */}

			<LogoUploader name='logoUrl' />
		</Box>
	);
};
