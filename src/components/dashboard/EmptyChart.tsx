import { Box, Heading, Text } from '@chakra-ui/react';
import { memo } from 'react';


import { useTranslations } from '@/translations';

interface EmptyChartProps {
  title: string;
}

export const EmptyChart = memo<EmptyChartProps>(({ title }) => {
  const { t } = useTranslations();

  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="lg"
      p={6}
      shadow="sm"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="400px"
    >
      <Heading mb={2} size="md">
        {title}
      </Heading>
      <Text color="gray.500" _dark={{ color: 'gray.400' }}>
        {t('dashboard.empty.description')}
      </Text>
    </Box>
  );
});

EmptyChart.displayName = 'EmptyChart';
