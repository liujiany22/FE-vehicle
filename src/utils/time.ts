// utils/time.ts
import { format } from 'date-fns';

export const formatDate = (date: string | null): string => {
  return date ? format(new Date(date), 'yyyy-MM-dd') : '';
};
