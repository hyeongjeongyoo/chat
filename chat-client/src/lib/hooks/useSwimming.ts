import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swimmingKeys, getLessons, getLesson, getLessonsByPeriod, getLockers, getLocker, enrollLesson, cancelEnroll, getMyEnrolls, getMyEnrollsByStatus, getEnroll, payEnroll, getRenewalInfo, processRenewal } from '@/lib/api/swimming';
import { PaginationParams } from '@/types/api';
import { EnrollRequestDto, CancelRequestDto, PaymentRequestDto, RenewalRequestDto } from '@/types/swimming';

// 강습 목록 조회 훅
export const useLessons = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [...swimmingKeys.lessons(), params],
    queryFn: () => getLessons(params)
  });
};

// 특정 강습 상세 조회 훅
export const useLesson = (lessonId: number) => {
  return useQuery({
    queryKey: swimmingKeys.lesson(lessonId),
    queryFn: () => getLesson(lessonId),
    enabled: !!lessonId
  });
};

// 기간별 강습 목록 조회 훅
export const useLessonsByPeriod = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: swimmingKeys.lessonsByPeriod(startDate, endDate),
    queryFn: () => getLessonsByPeriod(startDate, endDate),
    enabled: !!startDate && !!endDate
  });
};

// 사물함 목록 조회 훅
export const useLockers = (gender?: string) => {
  return useQuery({
    queryKey: swimmingKeys.lockers(gender),
    queryFn: () => getLockers(gender)
  });
};

// 특정 사물함 상세 조회 훅
export const useLocker = (lockerId: number) => {
  return useQuery({
    queryKey: swimmingKeys.locker(lockerId),
    queryFn: () => getLocker(lockerId),
    enabled: !!lockerId
  });
};

// 강습 신청 훅
export const useEnrollLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollRequest: EnrollRequestDto) => enrollLesson(enrollRequest),
    onSuccess: () => {
      // 신청 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: swimmingKeys.myEnrolls() });
      queryClient.invalidateQueries({ queryKey: swimmingKeys.lessons() });
    }
  });
};

// 신청 취소 훅
export const useCancelEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollId, cancelRequest }: { enrollId: number; cancelRequest: CancelRequestDto }) => cancelEnroll(enrollId, cancelRequest),
    onSuccess: () => {
      // 취소 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: swimmingKeys.myEnrolls() });
      queryClient.invalidateQueries({ queryKey: swimmingKeys.lessons() });
    }
  });
};

// 내 신청 내역 조회 훅
export const useMyEnrolls = () => {
  return useQuery({
    queryKey: swimmingKeys.myEnrolls(),
    queryFn: getMyEnrolls
  });
};

// 상태별 신청 내역 조회 훅
export const useMyEnrollsByStatus = (status: string, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [...swimmingKeys.myEnrollsByStatus(status), params],
    queryFn: () => getMyEnrollsByStatus(status, params),
    enabled: !!status
  });
};

// 특정 신청 상세 조회 훅
export const useEnroll = (enrollId: number) => {
  return useQuery({
    queryKey: swimmingKeys.enroll(enrollId),
    queryFn: () => getEnroll(enrollId),
    enabled: !!enrollId
  });
};

// 결제 처리 훅
export const usePayEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentRequest: PaymentRequestDto) => payEnroll(paymentRequest),
    onSuccess: () => {
      // 결제 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: swimmingKeys.myEnrolls() });
    }
  });
};

// 재등록 안내 조회 훅
export const useRenewalInfo = () => {
  return useQuery({
    queryKey: swimmingKeys.renewal(),
    queryFn: getRenewalInfo
  });
};

// 재등록 처리 훅
export const useProcessRenewal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (renewalRequest: RenewalRequestDto) => processRenewal(renewalRequest),
    onSuccess: () => {
      // 재등록 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: swimmingKeys.myEnrolls() });
      queryClient.invalidateQueries({ queryKey: swimmingKeys.renewal() });
      queryClient.invalidateQueries({ queryKey: swimmingKeys.lessons() });
    }
  });
}; 