import styled from 'styled-components';

const List = styled.ol`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  align-items: center;
  border-bottom: 1px solid #cdcdcd;
  display: flex;
`;

const Name = styled.span`
  flex: 1;
  padding: 12px 0;
`;

const Result = styled.span`
  text-decoration: none;
  a:link {
    color: #000;
  }
  a:visited {
    color: #000;
  }
  a:hover {
    color: #787886;
  }
`;

const Rank = styled.span`
  font-family: 'NYT-KarnakCondensed', serif;
  width: 30px;
`;

const UnrankedItem = styled(ListItem)`
  color: #c4c4c4;
`;

type Result = number | string | null;

export interface RankedListItem {
  name: string;
  result: Result;
  link?: any | undefined;
}

interface RankedListProps {
  list: RankedListItem[];
}

function RankedList({list}: RankedListProps) {
  let lastRank = 0;
  let lastResult: Result = null;

  const listItems = list.map(({name, result, link}) => {
    if (result == null) {
      return (
        <UnrankedItem key={name}>
          <Rank>•</Rank>
          <Name>{name}</Name>
          <Result>--</Result>
        </UnrankedItem>
      );
    }

    const rank = result === lastResult ? null : ++lastRank;
    lastResult = result;

    return (
      <ListItem key={name}>
        <Rank>{rank}</Rank>
        <Name>{name}</Name>
        <Result>{link != null ? link : result}</Result>
      </ListItem>
    );
  });

  return <List>{listItems}</List>;
}

export default RankedList;
