import { Box, FormControl, FormLabel, Input, FormErrorMessage, SimpleGrid, Text } from '@chakra-ui/react';
import type { Step3Data } from '../../types/dtos';
import { useFormContext } from 'react-hook-form';

export const Step3Admin = () => {
  const { register, watch, formState: { errors } } = useFormContext<Step3Data>();
    const password = watch('password');
    
    console.log(password);
    

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        <FormControl id="firstName" isInvalid={!!errors.firstName}>
          <FormLabel>First Name</FormLabel>
          <Input placeholder="John" {...register('firstName')} />
          <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl id="lastName" isInvalid={!!errors.lastName}>
          <FormLabel>Last Name</FormLabel>
          <Input placeholder="Adeyemi" {...register('lastName')} />
          <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      <FormControl id="position" isInvalid={!!errors.position} mb={4}>
        <FormLabel>Position / Role</FormLabel>
        <Input placeholder="Principal, IT Admin" {...register('position')} />
        <FormErrorMessage>{errors.position?.message}</FormErrorMessage>
      </FormControl>

      <FormControl id="adminEmail" isInvalid={!!errors.adminEmail} mb={4}>
        <FormLabel>Administrator Email Address</FormLabel>
        <Input type="email" placeholder="admin@greenfield.edu.ng" {...register('adminEmail')} />
        <FormErrorMessage>{errors.adminEmail?.message}</FormErrorMessage>
      </FormControl>
      
      <FormControl id="adminPhone" isInvalid={!!errors.adminPhone} mb={4}>
        <FormLabel>Phone Number (Optional)</FormLabel>
        <Input placeholder="+234 801 234 5678" {...register('adminPhone')} />
        <FormErrorMessage>{errors.adminPhone?.message}</FormErrorMessage>
      </FormControl>

      <FormControl id="password" isInvalid={!!errors.password} mb={4}>
        <FormLabel>Password</FormLabel>
        <Input type="password" {...register('password')} />
        {errors.password ? (
             <FormErrorMessage>{errors.password.message}</FormErrorMessage>
        ) : (
             <Text fontSize="sm" color="gray.500">
                At least 8 chars, one uppercase, one number, and one symbol.
            </Text>
        )}
      </FormControl>
      
      <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword} mb={4}>
        <FormLabel>Confirm Password</FormLabel>
        <Input type="password" {...register('confirmPassword')} />
        <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};