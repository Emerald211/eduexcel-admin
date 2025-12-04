import {
	Box,
	Heading,
	Input,
	Button,
	FormControl,
	FormLabel,
	FormErrorMessage,
	useToast,
	Center,
  Text,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../types/dtos';
import type { LoginDto } from '../types/dtos';
import { useLoginMutation } from '../services/authApi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice';

interface RtkQueryError {
	data?: {
		message: string;
	};
	status?: number;
}

const LoginPage = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginDto>({
		resolver: zodResolver(loginSchema),
	});
	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [login, { isLoading }] = useLoginMutation();

	const onSubmit = async (data: LoginDto) => {
		try {
			const response = await login(data).unwrap();

			dispatch(setCredentials(response)); // Store token in Redux and localStorage

			toast({
				title: 'Login Successful',
				description: 'Welcome back!',
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
			navigate('/dashboard');
		} catch (error) {
			const serverMessage = (error as RtkQueryError)?.data?.message;

			const errorMessage = serverMessage || 'Invalid email or password.';
			toast({
				title: 'Login Failed',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
	};

	return (
		<Center minH='100vh' bg='gray.50'>
			<Box
				width='700px'
				height='70vh'
				maxW='700px'
				borderWidth={1}
				borderRadius='lg'
				boxShadow='lg'
				bg='white'>
				<Center>
					<Box fontFamily='Montserrat' p={8} width='500px'>
						<Heading
							fontFamily='Montserrat'
							as='h4'
							size='lg'
							textAlign='center'
							mb={8}
							color='black'>
							Welcome to Edutage, Log into you account
						</Heading>
						<form onSubmit={handleSubmit(onSubmit)}>
							<FormControl id='email' isInvalid={!!errors.email} mb={4}>
								<FormLabel>Email Address</FormLabel>
								<Input
									type='email'
									placeholder='admin@school.com'
									{...register('email')}
								/>
								<FormErrorMessage>{errors.email?.message}</FormErrorMessage>
							</FormControl>

							<FormControl id='password' isInvalid={!!errors.password} mb={6}>
								<FormLabel>Password</FormLabel>
								<Input
									type='password'
									placeholder='Enter password'
									{...register('password')}
								/>
								<FormErrorMessage>{errors.password?.message}</FormErrorMessage>
							</FormControl>

							<Button
								type='submit'
								color="white"
								bgColor="black"
								width='full'
								mt={4}
								isLoading={isLoading}>
								Sign In
							</Button>
						</form>

						<Center  mt={4}>
							<Text fontSize='md' color='gray.700'>
								Don’t have an account?{' '}
								<Link
									style={{fontWeight: "bold"}}
									to='/onboarding/create-account'
									
									
									>
									Sign up!
								</Link>
							</Text>
						</Center>
					</Box>
				</Center>
			</Box>
		</Center>
	);
};

export default LoginPage;
