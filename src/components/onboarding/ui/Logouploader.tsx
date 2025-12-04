import React, { useState } from 'react';
import {
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
	Box,
	Text,
	Spinner,
	Image,
	useToast,
	Flex,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import axios from 'axios';

// Ensure this URL is correct for your environment
const UPLOAD_URL =
	'https://eduexcel-backend.onrender.com/api/v1/auth/upload-logo'; // Adjust port if necessary

interface LogoUploaderProps {
	name: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ name }) => {
	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = useFormContext();
	const toast = useToast();

	// Watch the current logoUrl value in RHF
	const currentLogoUrl = watch(name);

	const [isUploading, setIsUploading] = useState(false);
	const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// 1. Create FormData object
		const formData = new FormData();
		formData.append('file', file); // 'file' must match the @UseInterceptors(FileInterceptor('file')) key

		setIsUploading(true);
		setPreview(null);
		setValue(name, '', { shouldValidate: true }); // Clear URL while uploading

		try {
			// 2. Upload the file to the NestJS endpoint
			const response = await axios.post<{ logoUrl: string }>(
				UPLOAD_URL,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			const uploadedUrl = response.data.logoUrl;

			// 3. Save the returned Cloudinary URL back into the RHF state
			setValue(name, uploadedUrl, { shouldValidate: true, shouldDirty: true });
			setPreview(uploadedUrl);

			toast({
				title: 'Logo Uploaded',
				description: 'Image successfully hosted.',
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error('Upload error:', error);
			toast({
				title: 'Upload Failed',
				description: 'Could not upload the logo. Check server status.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
			// Clear the value and preview on failure
			setValue(name, '', { shouldValidate: true });
			setPreview(null);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<FormControl isInvalid={!!errors[name]} mb={4}>
			<FormLabel htmlFor='logo-upload'>School Logo</FormLabel>
			<Input
				id='logo-upload'
				type='file'
				accept='image/*'
				onChange={handleFileChange}
				disabled={isUploading}
				p={1}
			/>
			<FormErrorMessage>{errors[name]?.message as string}</FormErrorMessage>

			{(isUploading || preview) && (
				<Box mt={4} p={3} border='1px' borderColor='gray.200' borderRadius='md'>
					{isUploading && (
						<Flex align='center'>
							<Spinner size='sm' mr={3} />
							<Text fontSize='sm' color='gray.600'>
								Uploading...
							</Text>
						</Flex>
					)}
					{preview && !isUploading && (
						<Box>
							<Text fontSize='sm' color='green.600' mb={2}>
								Logo successfully uploaded:
							</Text>
							<Image
								src={preview}
								alt='Logo Preview'
								maxH='100px'
								objectFit='contain'
								mb={2}
							/>
						</Box>
					)}
				</Box>
			)}
			{/* Hidden input to hold the actual URL value for RHF validation/submission */}
			<Input type='hidden' {...register(name)} />
		</FormControl>
	);
};
