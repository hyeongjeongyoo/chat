import { Box, Heading } from "@chakra-ui/react";
import { MainHeroSection } from "./component/MainHeroSection";
import { ApplySection } from "./component/ApplySection";
import { NoticeSection } from "./component/NoticeSection";
import { MarqueeSection } from "./component/MarqueeSection";
import { useQuery } from "@tanstack/react-query";
import { contentApi, contentKeys } from "@/lib/api/content";
import { ContentBlock } from "@/types/api/content";

const MainSection = () => {
  const { data: contents = [] } = useQuery<ContentBlock[]>({
    queryKey: contentKeys.list(0), // 0은 메인 페이지를 의미
    queryFn: () => contentApi.getMainPageContentBlocks(),
  });

  console.log("contents", contents);
  return (
    <Box
      as="main"
      id="mainContent"
      pt={100}
      fontFamily="'Paperlogy', sans-serif"
      lineHeight="1"
      maxW={{ base: "90%", "2xl": "1600px" }}
      mx="auto"
    >
      <Heading
        as="h3"
        mb={{ base: 5, md: 6, lg: 7 }}
        fontSize={{ base: "24px", md: "32px", lg: "40px" }}
        fontWeight="bold"
        color={"#444445"}
        lineHeight={"1"}
        fontFamily="'Paperlogy', sans-serif"
        w={"100%"}
        maxW={"1600px"}
        mx="auto"
        my={0}
      >
        {contents[0]?.content}
      </Heading>
      <MainHeroSection data={[contents[1], contents[2], contents[3]]} />
      <MarqueeSection data={contents[4]} />
      <NoticeSection data={contents[5]} />
      <ApplySection data={contents[6]} />
      {/* <EstimateSection /> */}
    </Box>
  );
};

export default MainSection;
