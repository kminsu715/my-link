export interface LinkItem {
  id: string;
  title: string;
  url: string;
  clickCount?: number; // 추후 추가될 클릭 조회수 카운트
}

export const dummyLinks: LinkItem[] = [
  {
    id: '1',
    title: '인스타그램',
    url: 'https://instagram.com',
    clickCount: 0,
  },
  {
    id: '2',
    title: '유튜브',
    url: 'https://youtube.com',
    clickCount: 0,
  },
  {
    id: '3',
    title: '블로그',
    url: 'https://blog.naver.com',
    clickCount: 0,
  },
  {
    id: '4',
    title: 'GitHub',
    url: 'https://github.com',
    clickCount: 0,
  },
  {
    id: '5',
    title: '포트폴리오',
    url: 'https://my-portfolio.com',
    clickCount: 0,
  },
];
