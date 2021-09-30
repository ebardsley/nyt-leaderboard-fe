import Link from 'next/link';
import styled from 'styled-components';
import {useRouter} from 'next/router';
import { GetStaticProps } from 'next'


import Heading from 'Heading';
import Layout, { FixedContainer, MessageContainer } from 'Layout';
import RankedList from 'RankedList';
import {getOffsetDate, secondsToMinutes, toReadableDate} from 'utils';
import {getFirstPuzzleDate, getLatestPuzzleDate, usePuzzleLeaderboard, usePuzzleResults} from 'data';

const Button = styled.button`
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: pointer;

  &:hover {
    background-color: #f4f4f4;
  }
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledArrow = styled(Button).attrs((props: {
  reversed: boolean,
  disabled: boolean,
}) => props)`
  background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMCAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojOTU5NTk1O3N0cm9rZS13aWR0aDoyO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTEsMTUuMUw4LjEsOEwxLDAuOSIvPgo8L3N2Zz4K);
  background-position: 54%;
  background-repeat: no-repeat;
  background-size: 11px;
  font-size: 0;
  height: 40px;
  width: 40px;
  ${props => props.reversed && `
    transform: scaleX(-1);
  `}
  ${props => props.disabled && `
    opacity: 0.3;
    cursor: default;
    &:hover {
      background-color: #fff;
    }
  `}
`;

const StyledDoubleArrow = styled(StyledArrow)`
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIwLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNSAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojOTU5NTk1O3N0cm9rZS13aWR0aDoyO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTEsMTUuMUw4LjEsOEwxLDAuOSIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNiwxNS4xTDEzLjEsOEw2LDAuOSIvPgo8L3N2Zz4K);
  background-size: 16px;
`;

interface DateButtonProps {
  date: string;
}

function NextButton({ date }: DateButtonProps) {
  const next = getOffsetDate(date, 1);
  if (!next || next == "") {
    return (
      <span>
        <StyledArrow disabled={true}>Next Leaderboard</StyledArrow>
        <StyledDoubleArrow disabled={true}>Latest Leaderboard</StyledDoubleArrow>
      </span>
    )
  }
  return (
    <span>
      <Link href="/leaderboard/[date]" as={`/leaderboard/${next}`} passHref>
        <StyledArrow>Next Leaderboard</StyledArrow>
      </Link>
      <Link href="/leaderboard/[date]" as={`/leaderboard/${getLatestPuzzleDate()}`} passHref>
        <StyledDoubleArrow>Latest Leaderboard</StyledDoubleArrow>
      </Link>
    </span>
  );
}

function PrevButton({ date }: DateButtonProps) {
  const prev = getOffsetDate(date, -1);
  if (!prev || prev == "") {
    return (
      <span>
        <StyledDoubleArrow reversed={true} disabled={true}>Earliest Leaderboard</StyledDoubleArrow>
        <StyledArrow reversed={true} disabled={true}>Previous Leaderboard</StyledArrow>
      </span>
    )
  }
  return (
    <span>
      <Link href="/leaderboard/[date]" as={`/leaderboard/${getFirstPuzzleDate()}`} passHref>
        <StyledDoubleArrow reversed={true}>Earliest Leaderboard</StyledDoubleArrow>
      </Link>
      <Link href="/leaderboard/[date]" as={`/leaderboard/${prev}`} passHref>
        <StyledArrow reversed={true}>Previous Leaderboard</StyledArrow>
      </Link>
    </span>
  );
}

interface PuzzleLeaderboardProps {
  date: string | undefined;
}

function PuzzleLeaderboard({date}: PuzzleLeaderboardProps) {
  if (date == null) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return <MessageContainer>Invalid date</MessageContainer>;
  }

  const leaderboard = usePuzzleLeaderboard(date);
  const formattedLeaderboard = leaderboard.map(({name, time}) => ({
    name,
    result: time && secondsToMinutes(time),
  }));

  return (
    <FixedContainer>
      <Header>
        <PrevButton date={date} />
        <Heading heading="Your Leaderboard" subHeading={toReadableDate(date)} />
        <NextButton date={date} />
      </Header>
      <RankedList list={formattedLeaderboard} />
    </FixedContainer>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const data = usePuzzleResults();
  return {
    props: { data, }, // will be passed to the page component as props
  }
}

export async function getStaticPaths() {
  const results = usePuzzleResults();
  const ret = {
    paths: results.map(x => {
      return { params: { date: x.date } }
    }),
    fallback: false
  };
  return ret;
}

function LeaderboardPage() {
  const {date} = useRouter().query;
  const dateString = Array.isArray(date) ? date[0]: date;

  return (
    <Layout title={`${dateString ?? ''} Leaderboard`}>
      <PuzzleLeaderboard date={dateString} />
    </Layout>
  );
}

export default LeaderboardPage;
