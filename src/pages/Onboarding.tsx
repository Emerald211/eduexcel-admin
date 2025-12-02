import { useState, useMemo } from 'react';
import {
	Box,
	Flex,
	Button,
	Heading,
	useToast,
	Stepper,
	Step,
	StepIndicator,
	StepStatus,
	StepIcon,
	StepNumber,
	StepTitle,
	StepSeparator,
	useSteps,
} from '@chakra-ui/react';
import { Step1Profile } from '../components/onboarding/Step1Profile';
import { Step2Location } from '../components/onboarding/Step2Location';
import { Step3Admin } from '../components/onboarding/Step3Admin';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { fullOnboardSchema } from '../types/dtos';
import type { FullOnboardFormData, OnboardSchoolDto } from '../types/dtos';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardSchoolMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';

interface RtkQueryError {
	data?: {
		message: string;
	};
}

const steps = [
	{
		title: 'Registration',
		component: Step1Profile,
		schema: fullOnboardSchema.pick({
			schoolName: true,
			schoolType: true,
			schoolCategory: true,
			registrationNumber: true,
		}),
	},
	{
		title: 'School Information',
		component: Step2Location,
		schema: fullOnboardSchema.pick({
			address: true,
			country: true,
			state: true,
			city: true,
			schoolEmail: true,
			schoolPassword: true,
			schoolPhone: true,
			logoUrl: true,
		}),
	},
	{
		title: 'Administrator Information',
		component: Step3Admin,
		schema: fullOnboardSchema.pick({
			firstName: true,
			lastName: true,
			position: true,
			adminEmail: true,
			adminPhone: true,
			password: true,
			confirmPassword: true,
		}),
	},
];

const components = [Step1Profile, Step2Location, Step3Admin];
type DynamicStepResolver = Resolver<OnboardSchoolDto, unknown>;

const OnboardingPage = () => {
	const [formData, setFormData] = useState<Partial<OnboardSchoolDto>>({});
	const { activeStep, goToNext, goToPrevious } = useSteps({ index: 0 });
	const toast = useToast();
	const navigate = useNavigate();
	const [onboardSchool, { isLoading }] = useOnboardSchoolMutation();

	const methods = useForm<OnboardSchoolDto>({
		resolver: zodResolver(
			steps[activeStep].schema
		) as unknown as DynamicStepResolver,
		defaultValues: formData as OnboardSchoolDto,
		mode: 'onBlur',
	});

	const { reset, handleSubmit, setFocus, getValues } = methods;

	useMemo(() => {
		reset(formData as OnboardSchoolDto);
		const currentSchemaShape = steps[activeStep].schema.shape;
		if (currentSchemaShape) {
			const firstFieldName = Object.keys(currentSchemaShape)[0];
			if (firstFieldName) {
				setFocus(firstFieldName as keyof OnboardSchoolDto);
			}
		}
	}, [activeStep, reset, setFocus, formData]);

	const CurrentStepComponent = components[activeStep];
	const isLastStep = activeStep === steps.length - 1;

	const handleNext = async (data: OnboardSchoolDto) => {
		setFormData((prev) => ({ ...prev, ...data }));
		if (isLastStep) {
			const finalSubmissionData = getValues() as FullOnboardFormData;
			await handleSubmitFinal(finalSubmissionData);
		} else {
			goToNext();
		}
	};

	const handleSubmitFinal = async (finalData: FullOnboardFormData) => {
		try {
			const { confirmPassword, ...dataToSend } = finalData;
			console.log(confirmPassword);

			await onboardSchool(dataToSend).unwrap();
			toast({
				title: 'Account Created.',
				description: 'Your school is onboarded! Please log in.',
				status: 'success',
				duration: 5000,
				isClosable: true,
			});
			navigate('/');
		} catch (error) {
			const serverMessage = (error as RtkQueryError)?.data?.message;
			const errorMessage =
				serverMessage || 'An unexpected error occurred during signup.';
			toast({
				title: 'Signup Failed',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
	};

	return (
		<Box
			bg='white'
			fontFamily='Montserrat'
			margin='20'
			borderRadius='lg'
			display='flex'
			flexDirection='column'
			alignItems='center'
			justifyContent='center'
			maxW='700px'
			mx='auto'
			p={8}>
			<Heading
				as='h1'
				size='xl'
				textAlign='center'
				color='blue.900'
				fontFamily='Montserrat'
				mb={10}>
				Welcome, create your school account
			</Heading>

			<Stepper
				index={activeStep}
				mb={12}
				width='100%'
				display='flex'
				justifyContent='space-between'
				alignItems='center'>
				{steps.map((step, index) => (
					<Step
						key={index}
						display='flex'
						flexDirection='column'
						alignItems='center'>
						<StepIndicator>
							<StepStatus
								complete={
									<StepIcon
										boxSize='3rem'
										color='white'
										bg='green.500'
										borderRadius='full'
										fontWeight='bold'
										fontSize='sm'
										display='flex'
										justifyContent='center'
										alignItems='center'
										transition='all 0.2s ease-in-out'
									/>
								}
								incomplete={
									<StepNumber
										boxSize='3rem'
										bg='gray.300'
										color='gray.700'
										borderRadius='full'
										fontWeight='bold'
                    fontSize='xl'
                    border='none'
										display='flex'
										justifyContent='center'
										alignItems='center'
										transition='all 0.2s ease-in-out'
									/>
								}
								active={
									<StepNumber
										boxSize='3rem'
										bg='blue.900'
										color='white'
										borderRadius='full'
										fontWeight='bold'
										fontSize='xl'
										display='flex'
										justifyContent='center'
										alignItems='center'
										border='none'
										transition='all 0.2s ease-in-out'
									/>
								}
							/>
						</StepIndicator>

						<Box flexShrink={0} mt={2} textAlign='center'>
							<StepTitle fontWeight='medium' fontSize='md' color='gray.800'>
								{step.title}
							</StepTitle>
						</Box>

						{index < steps.length - 1 && <StepSeparator />}
					</Step>
				))}
			</Stepper>

			<FormProvider {...methods}>
				<Box
					as='form'
					onSubmit={handleSubmit(handleNext)}
					key={activeStep}
					sx={{ animation: 'fadeIn 0.5s ease-in-out' }}
					width='100%'>
					<CurrentStepComponent />

					<Flex width='100%' justify='space-between' mt={10}>
						<Button
							isDisabled={activeStep === 0 || isLoading}
							onClick={goToPrevious}
							variant='outline'
							colorScheme='blue'>
							Back
						</Button>

						<Button
							type='submit'
							colorScheme='blue'
							bg='blue.900'
							isLoading={isLoading}
							loadingText={isLastStep ? 'Creating Account...' : 'Validating'}>
							{isLastStep ? 'Create Account' : 'Next Step'}
						</Button>
					</Flex>
				</Box>
			</FormProvider>
		</Box>
	);
};

export default OnboardingPage;
