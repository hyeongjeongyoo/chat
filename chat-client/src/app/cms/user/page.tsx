"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { UserGrid, UserGridRef } from "./components/UserGrid";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { UserEnrollmentHistoryDto } from "@/types/api";
import { userCmsApi, UserListParams } from "@/lib/api/userCms";
import { AxiosError } from "axios";
import { CustomPagination } from "@/components/common/CustomPagination";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { UserDetailDialog } from "./components/UserDetailDialog";
import { ChangeLessonDialog } from "./components/ChangeLessonDialog";

const SEARCH_TYPE_OPTIONS = [
  { value: "ALL", label: "전체유형" },
  { value: "username", label: "ID" },
  { value: "name", label: "이름" },
  { value: "phone", label: "연락처" },
  { value: "lessonTime", label: "강습 시간" },
];

const PAY_STATUS_OPTIONS = [
  { value: "", label: "전체상태" },
  { value: "PAID", label: "결제완료" },
  { value: "REFUNDED", label: "환불" },
  { value: "PARTIAL_REFUNDED", label: "부분환불" },
];

export default function UserManagementPage() {
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<UserEnrollmentHistoryDto | null>(null);
  const [userForLessonChange, setUserForLessonChange] =
    useState<UserEnrollmentHistoryDto | null>(null);
  const [detailedUser, setDetailedUser] =
    useState<UserEnrollmentHistoryDto | null>(null);
  const [users, setUsers] = useState<UserEnrollmentHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1 });
  const editingUserIdRef = useRef<string | null>(null);
  const gridRef = useRef<UserGridRef>(null);

  const [filters, setFilters] = useState({
    searchType: "ALL",
    searchTerm: "",
    payStatus: "",
  });

  const [query, setQuery] = useState<UserListParams>({
    page: 0,
    size: 20,
  });

  const colors = useColors();
  const bg = useColorModeValue(colors.bg, colors.darkBg);
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );

  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const filteredParams = Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            acc[key as keyof UserListParams] = value;
          }
          return acc;
        },
        {} as Partial<UserListParams>
      );

      const response = await userCmsApi.getUsers(
        filteredParams as UserListParams
      );
      const pageData = response.data.data;
      setUsers(pageData.content);
      setPageInfo({ totalPages: pageData.totalPages });
    } catch (error) {
      console.error("Error fetching users:", error);
      const err = error as AxiosError<{ message?: string }>;
      toaster.create({
        title: "사용자 목록을 불러오는데 실패했습니다.",
        description: err.response?.data?.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const { searchType, searchTerm, payStatus } = filters;
    const newQuery: UserListParams = {
      page: 0,
      size: query.size,
      payStatus,
    };

    if (searchTerm) {
      if (searchType === "ALL") {
        newQuery.searchKeyword = searchTerm;
      } else {
        newQuery[
          searchType as keyof Omit<
            UserListParams,
            "payStatus" | "page" | "size"
          >
        ] = searchTerm;
      }
    }

    setQuery(newQuery);
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setQuery((prev) => ({ ...prev, page: 0, size }));
  };

  const handleAddUser = () => setSelectedUserForEdit(null);
  const handleEditUser = (user: UserEnrollmentHistoryDto) => {
    editingUserIdRef.current = user.uuid;
    setUserForLessonChange(user);
    setTimeout(() => {
      editingUserIdRef.current = null;
    }, 100);
  };
  const handleShowDetails = (user: UserEnrollmentHistoryDto) => {
    if (editingUserIdRef.current === user.uuid) {
      return;
    }
    setDetailedUser(user);
  };
  const handleCloseDetails = () => setDetailedUser(null);
  const handleCloseLessonChangeModal = () => setUserForLessonChange(null);

  const handleExport = () => {
    gridRef.current?.exportToCsv();
  };

  const handleCloseEditor = () => setSelectedUserForEdit(null);

  const handleSubmit = async (userData: Partial<UserEnrollmentHistoryDto>) => {
    try {
      if (selectedUserForEdit?.uuid) {
        const updatePayload = {
          name: userData.name,
          phone: userData.phone,
          status: userData.status,
        };
        await userCmsApi.updateUser(selectedUserForEdit.uuid, updatePayload);
      } else {
        const createPayload = {
          username: userData.username,
          name: userData.name,
          phone: userData.phone,
        };
        await userCmsApi.createUser(createPayload);
      }
      refreshUsers();
      setSelectedUserForEdit(null);
      toaster.create({
        title: selectedUserForEdit
          ? "사용자 정보가 수정되었습니다."
          : "사용자가 생성되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving user:", error);
      const err = error as AxiosError<{ message?: string }>;
      toaster.create({
        title: "사용자 저장에 실패했습니다.",
        description: err.response?.data?.message,
        type: "error",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userCmsApi.deleteUser(userId);
      refreshUsers();
      setSelectedUserForEdit(null);
      toaster.create({
        title: "사용자가 삭제되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      const err = error as AxiosError<{ message?: string }>;
      toaster.create({
        title: "사용자 삭제에 실패했습니다.",
        description: err.response?.data?.message,
        type: "error",
      });
    }
  };

  const userLayout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    {
      id: "userList",
      x: 0,
      y: 1,
      w: 13,
      h: 11,
      title: "회원 목록",
      subtitle: "등록된 회원 목록입니다.",
    },
  ];

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={userLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                회원 관리
              </Heading>
              <Badge
                bg={colors.secondary.light}
                color={colors.secondary.default}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
              >
                관리자
              </Badge>
            </Flex>
          </Flex>

          <Box>
            <CommonGridFilterBar
              searchTerm={filters.searchTerm}
              onSearchTermChange={(e) =>
                handleFilterChange({
                  target: { name: "searchTerm", value: e.target.value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              onSearchButtonClick={handleSearch}
              onExport={handleExport}
              selectFilters={[
                {
                  id: "payStatus",
                  label: "최근 결제 상태",
                  value: filters.payStatus,
                  onChange: handleFilterChange,
                  options: PAY_STATUS_OPTIONS,
                },
                {
                  id: "searchType",
                  label: "검색 유형",
                  value: filters.searchType,
                  onChange: handleFilterChange,
                  options: SEARCH_TYPE_OPTIONS,
                },
              ]}
            />
            <UserGrid
              ref={gridRef}
              users={users}
              onRowSelected={handleShowDetails}
              onEditUser={handleEditUser}
              isLoading={isLoading}
              selectedUserId={userForLessonChange?.uuid}
            />
            <CustomPagination
              currentPage={query.page || 0}
              totalPages={pageInfo.totalPages}
              onPageChange={handlePageChange}
              pageSize={query.size || 20}
              onPageSizeChange={handlePageSizeChange}
            />
          </Box>
        </GridSection>
        <UserDetailDialog
          isOpen={!!detailedUser}
          onClose={handleCloseDetails}
          user={detailedUser}
        />
        <ChangeLessonDialog
          isOpen={!!userForLessonChange}
          onClose={handleCloseLessonChangeModal}
          user={userForLessonChange}
          onSuccess={() => {
            handleCloseLessonChangeModal();
            refreshUsers();
          }}
        />
      </Box>
    </Box>
  );
}
