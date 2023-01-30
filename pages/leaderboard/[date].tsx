import Link from 'next/link';
import {GetStaticProps} from 'next'

import Heading from 'Heading';
import Layout, {
  FixedContainer,
  MessageContainer,
  BoardHeader,
  StyledArrow,
  StyledDoubleArrow
} from 'Layout';
import RankedList from 'RankedList';
import {getOffsetDate, secondsToMinutes, toReadableDate} from 'utils';
import {
  DataByPlayer, PuzzleLeaderboardTime,
  getFirstPuzzleDate, getLatestPuzzleDate, leaderboardForDate, dataByDate
} from 'data';
import {loadData} from 'static-utils';

interface DateButtonProps {
  date: LeaderboardDate;
}

function NextButton({ date }: DateButtonProps) {
  const next = date.next;
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
      <Link href="/leaderboard/[date]" as={`/leaderboard/latest`} passHref>
        <StyledDoubleArrow>Latest Leaderboard</StyledDoubleArrow>
      </Link>
    </span>
  );
}

function PrevButton({ date }: DateButtonProps) {
  const prev = date.previous;
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
      <Link href="/leaderboard/[date]" as={`/leaderboard/${date.first}`} passHref>
        <StyledDoubleArrow reversed={true}>Earliest Leaderboard</StyledDoubleArrow>
      </Link>
      <Link href="/leaderboard/[date]" as={`/leaderboard/${prev}`} passHref>
        <StyledArrow reversed={true}>Previous Leaderboard</StyledArrow>
      </Link>
    </span>
  );
}

function PuzzleLeaderboard({date, leaderboard}: LeaderboardPageProps) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.current)) {
    return <MessageContainer>Invalid date</MessageContainer>;
  }

  const formattedLeaderboard = leaderboard.map(({name, time}) => ({
    name,
    result: time && secondsToMinutes(time),
  }));

  return (
    <FixedContainer>
      <BoardHeader>
        <PrevButton date={date} />
        <Heading heading="Your Leaderboard" subHeading={toReadableDate(date.current)} />
        <NextButton date={date} />
      </BoardHeader>
      <RankedList list={formattedLeaderboard} />
    </FixedContainer>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  if (!context || !context.params || !context.params.date) {
    return {
      props: {},
    }
  }

  const byPlayer: DataByPlayer = loadData();
  const byDate = dataByDate(byPlayer);
  const {date} = context.params;
  let dateString = Array.isArray(date) ? date[0] : date;

  if (dateString == "latest") {
    dateString = getLatestPuzzleDate(byDate);
  }

  return {
    props: {
      date: {
        first: getFirstPuzzleDate(byDate),
        previous: getOffsetDate(byDate, dateString, -1),
        current: dateString,
        next: getOffsetDate(byDate, dateString, 1),
      },
      leaderboard: leaderboardForDate(dateString, byPlayer),
    },
  }
}

export async function getStaticPaths() {
  const results = dataByDate(loadData());
  const ret = {
    paths: results.map(x => {
      return { params: { date: x.date } }
    }).concat([{
      params: { date: "latest" }
    }]),
    fallback: false
  };
  return ret;
}

interface LeaderboardDate {
  current: string;
  first: string;
  previous: string;
  next: string;
  latest: string;
}

interface LeaderboardPageProps {
  date: LeaderboardDate;
  leaderboard: PuzzleLeaderboardTime[];
}

export default function LeaderboardPage({ date, leaderboard }: LeaderboardPageProps) {
  return (
    <Layout title={`${date.current ?? ''} Leaderboard`}>
      <PuzzleLeaderboard date={date} leaderboard={leaderboard} />
    </Layout>
  );
}
