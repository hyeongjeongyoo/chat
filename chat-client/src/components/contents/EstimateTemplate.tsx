"use client";

import { Box, Text, Flex, Heading } from "@chakra-ui/react";

interface EstimateTemplateProps {
  hallData: Array<{ name: string; days: number; price: number }>;
  roomData: Array<{
    name: string;
    nights: number;
    count: number;
    weekdayPrice: number;
    weekendPrice: number;
  }>;
  checkInDate?: string;
  checkOutDate?: string;
  totalAmount: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export default function EstimateTemplate({
  hallData,
  roomData,
  checkInDate,
  checkOutDate,
  totalAmount,
  companyInfo,
}: EstimateTemplateProps) {
  return (
    <Box
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        backgroundColor: "white",
        fontFamily:
          '"Noto Sans KR", "맑은고딕", "돋움", arial, Dotum, Verdana, helvetica, clean, sans-serif',
        fontSize: "12px",
        lineHeight: "1.4",
        color: "#333333",
        boxSizing: "border-box",
      }}
    >
      {/* 헤더 - 아르피나 로고 및 제목 */}
      <Box mb={6}>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text fontSize="14px" fontWeight="600" color="#464646" mb={2}>
              아르피나 단체예약 견적서
            </Text>
            <Box fontSize="10px" color="#515151" lineHeight="1.3">
              <Text>부산광역시 해운대구 해운대해변로 35</Text>
              <Text>대 표 자 : 신 창 호</Text>
              <Text>사업자등록번호 : 383-82-00288</Text>
              <Text>대표전화 : 051-731-9800</Text>
            </Box>
          </Box>
          <Box>
            {/* 로고 이미지 자리 */}
            <Box
              w="150px"
              h="40px"
              bg="#f0f0f0"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="10px"
              color="#666"
            >
              아르피나 로고
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* 견적가 표시 */}
      <Box
        mb={6}
        p={3}
        bg="rgba(255, 183, 0, 0.60)"
        borderRadius="4px"
        textAlign="left"
      >
        <Text fontSize="14px" fontWeight="bold" color="#000">
          견적가&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;￦{totalAmount.toLocaleString()}
        </Text>
      </Box>

      {/* 세미나실/세미나실 테이블 */}
      {hallData.length > 0 && (
        <Box mb={6}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "70px" }} />
              <col />
              <col style={{ width: "120px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "130px" }} />
            </colgroup>
            <tbody>
              <tr>
                <th
                  rowSpan={hallData.length + 2}
                  style={{
                    background: "transparent",
                    color: "#373737",
                    fontSize: "12px",
                    fontWeight: "500",
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  세미나실
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  층
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  구분
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  종류
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  정원
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  이용기간
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  단가
                </th>
                <th
                  style={{
                    background: "#DAE3F3",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  합계금액
                </th>
              </tr>
              {hallData.map((hall, index) => (
                <tr
                  key={index}
                  style={{ background: index % 2 === 0 ? "#FAFAFA" : "white" }}
                >
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "center",
                    }}
                  >
                    1F
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "center",
                    }}
                  >
                    소회의실
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "center",
                    }}
                  >
                    {hall.name}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "center",
                    }}
                  >
                    10명
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "center",
                    }}
                  >
                    {hall.days}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "right",
                    }}
                  >
                    ₩{hall.price.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    ₩{(hall.days * hall.price).toLocaleString()}
                  </td>
                </tr>
              ))}
              {/* 세미나실 소계 */}
              <tr>
                <td
                  colSpan={7}
                  style={{
                    background: "white",
                    padding: "8px",
                    color: "#2964CB",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "right",
                    border: "1px solid #ddd",
                  }}
                >
                  소계&nbsp;&nbsp;&nbsp;₩
                  {hallData
                    .reduce((sum, hall) => sum + hall.days * hall.price, 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
      )}

      {/* 객실 테이블 */}
      {roomData.length > 0 && (
        <Box mb={6}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "145px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "55px" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>
            <tbody>
              <tr>
                <th
                  rowSpan={roomData.length + 2}
                  style={{
                    background: "transparent",
                    fontSize: "12px",
                    color: "#373737",
                    fontWeight: "500",
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  객실
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  정원
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  타입
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  주중/주말
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  침실
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  이용기간
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  구성
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  단가
                </th>
                <th
                  style={{
                    background: "#B9DADF",
                    padding: "8px",
                    border: "1px solid #ddd",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  합계금액
                </th>
              </tr>
              {roomData.map((room, index) => {
                const avgPrice = Math.round(
                  (room.weekdayPrice + room.weekendPrice) / 2
                );
                const totalPrice = room.nights * room.count * avgPrice;
                return (
                  <tr
                    key={index}
                    style={{
                      background: index % 2 === 0 ? "#FAFAFA" : "white",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      2인실
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {room.name}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      주중/주말
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      싱글 1개
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {room.nights}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {room.count}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "right",
                      }}
                    >
                      ₩{avgPrice.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: "10px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      ₩{totalPrice.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {/* 객실 소계 */}
              <tr>
                <td
                  colSpan={8}
                  style={{
                    background: "white",
                    padding: "8px",
                    color: "#2964CB",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textAlign: "right",
                    border: "1px solid #ddd",
                  }}
                >
                  소계&nbsp;&nbsp;&nbsp;₩
                  {roomData
                    .reduce((sum, room) => {
                      const avgPrice = Math.round(
                        (room.weekdayPrice + room.weekendPrice) / 2
                      );
                      return sum + room.nights * room.count * avgPrice;
                    }, 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
      )}

      {/* 안내사항 */}
      <Box mb={6} fontSize="11px" color="#4E4E4E" lineHeight="1.4">
        <Text>
          해당 견적은 선택된 정보에 의해 산출된 견적으로 실제 금액과 다를 수
          있습니다.
        </Text>
        <Text>
          <Text as="span" color="#F00">
            정확한 견적
          </Text>
          은, 문의를 통해 확인 부탁드리겠습니다 감사합니다.
        </Text>
      </Box>

      {/* TOTAL 금액 */}
      <Box p={3} bg="#2D3091" borderRadius="4px" textAlign="right">
        <Text fontSize="14px" fontWeight="bold" color="#fff">
          TOTAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;￦{totalAmount.toLocaleString()}
        </Text>
      </Box>
    </Box>
  );
}
