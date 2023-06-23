import { GetStaticProps } from 'next'
import Link from 'next/link';
import styled from 'styled-components';
import {useRouter} from 'next/router';

import Heading from 'Heading';
import Layout, {Container, MessageContainer} from 'Layout';
import RankedList, { RankedListItem } from 'RankedList';
import {loadData} from 'static-utils';
import {getOffsetDate, secondsToMinutes, toReadableDate} from 'utils';
import {
  DataByPlayer, PlayerResult, getLatestPuzzleDate, dataForPeriod, dataByDate, DataByDate, useDateOrder, DateOrder
} from 'data';

interface PillProps {
  isActive: boolean;
}

const DateHeading = styled.h3`
  font: 16px 'NYT-Franklin', sans-serif;
  margin: 0;
`;

const Pill = styled.a<PillProps>`
  background: ${({isActive}) => isActive ? '#000': '#fff'};
  border: 1px solid ${({isActive}) => isActive ? '#000' : '#ccc'};
  border-radius: 50px;
  color: ${({isActive}) => isActive ? '#fff' : '#000'};
  display: inline-block;
  font-weight: ${({isActive}) => isActive ? '700' : '500'};
  margin: 12px 6px 0;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background: ${({isActive}) => isActive ? '#000': '#f4f4f4'};
  }

  /* Fix pixel shift from bold styling */
  &::before {
    content: attr(title);
    display: block;
    font-weight: 700;
    height: 0;
    visibility: hidden;
  }
`;

const Filters = styled.div`
  padding-top: 18px;
  text-align: center;
`;

const StatContainer = styled.div`
  margin: 30px;

  @media (min-width: 800px) {
    min-width: 300px;
  }
`;

interface PeriodFilterProps {
  href: string;
  isActive: boolean;
  title: string;
}

function PeriodFilter({href, isActive, title}: PeriodFilterProps) {
  return (
    <Link href={href} passHref scroll={false}>
      <Pill isActive={isActive} title={title}>{title}</Pill>
    </Link>
  );
}

interface StatContainerProps {
  list: RankedListItem[];
  title: string;
  subTitle?: string;
}

function Stat({list, title, subTitle}: StatContainerProps) {
  return (
    <StatContainer>
      <Heading heading={title} subHeading={subTitle}/>
      <RankedList list={list} />
    </StatContainer>
  );
}

interface Result {
  name: string;
  result: number;
}

type CompareFunction = (a: number, b: number) => number;

function compareResults(a: Result, b: Result, compareFunction: CompareFunction): number {
  if (a.result === b.result || isNaN(a.result) && isNaN(b.result)) {
    return a.name < b.name ? -1 : 1;
  }

  const comparison = compareFunction(a.result, b.result);
  if (isFinite(comparison)) {
    return comparison;
  }

  return isFinite(a.result) ? -1 : 1;
}

function compareResultsAscending(a: Result, b: Result): number {
  return compareResults(a, b, (x, y) => x - y);
}

function compareResultsDescending(a: Result, b: Result): number {
  return compareResults(a, b, (x, y) => y - x);
}

function AverageRanks(byPlayer: DataByPlayer, byDate: DataByDate) {
  const gamesPlayed = new Map();
  const summedRanks = new Map();

  for (const {name} of byPlayer) {
    gamesPlayed.set(name, 0);
    summedRanks.set(name, 0);
  }

  for (const {results} of byDate) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      summedRanks.set(name, summedRanks.get(name) + rank);
      gamesPlayed.set(name, gamesPlayed.get(name) + 1);
    }
  }

  return Array.from(summedRanks).map(([name, summedRank]) => ({
    name,
    result: summedRank / gamesPlayed.get(name),
  })).sort(compareResultsAscending)
    .map(({name, result}) => ({
      name,
      result: isNaN(result) ? null : result.toFixed(2),
    }));
}

function AverageTimes(byPlayer: DataByPlayer) {
  return byPlayer.map(({ name, results }) => ({
    name,
    result: results.reduce(
      (sum, { time }) => sum + time,
      0,
    ) / results.length,
  })).sort(compareResultsAscending).map(({ name, result }) => ({
    name,
    result: isNaN(result) ? null : secondsToMinutes(result),
  }));
}

function CurrentStreak(byPlayer: DataByPlayer, dateOrder: DateOrder) {
  return byPlayer.map(({name, results}) => {
    let result = 0;
    let lastDate = dateOrder.latest;

    for (let i = 0; i < results.length; i++) {
      const { date } = results[i];
      if (date === lastDate) {
        result++;
        lastDate = getOffsetDate(dateOrder, date, -1);
      } else {
        break;
      }
    }

    return {
      name,
      result,
    };
  }).sort(compareResultsDescending);
}

function FastestTimes(byPlayer: DataByPlayer) {
  return byPlayer.map(({ name, results }) => {
    const r = results.sort((a, b) => (a.time - b.time));
    const fastest: PlayerResult = r.length ? r[0] : { date: "", time: Infinity };
    return {
      name,
      result: fastest.time,
      date: fastest.date,
    }
  }).sort(compareResultsAscending)
    .map(({name, result, date}) => ({
      name,
      result: isFinite(result) ? secondsToMinutes(result) : null,
      link: isFinite(result) ? date : null,
    }));
}

function MedianRanks(byPlayer: DataByPlayer, byDate: DataByDate) {
  const ranks: Map<string, number[]> = new Map();

  for (const {name} of byPlayer) {
    ranks.set(name, []);
  }

  for (const {results} of byDate) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      const playerRanks = ranks.get(name);
      if (playerRanks) {
        playerRanks.push(rank);
      }
    }
  }

  return Array.from(ranks).map(([name, playerRanks]) => ({
    name,
    result: playerRanks.length ? playerRanks.sort(
      (a, b) => a - b
    )[Math.floor(playerRanks.length / 2)] : NaN,
  })).sort(compareResultsAscending);
}

function LongestStreak(byPlayer: DataByPlayer, dateOrder: DateOrder) {
  return byPlayer.map(({name, results}) => {
    let streak = 0;
    let longest = 0;
    let lastDate = dateOrder.latest;

    for (let i = 0; i < results.length; i++) {
      const {date} = results[i];
      if (date === lastDate) {
        streak++;
      } else {
        if (streak > longest) {
          longest = streak;
        }
        streak = 1;

        if (longest > results.length - i) {
          break;
        }
      }
      lastDate = getOffsetDate(dateOrder, date, -1);
    }

    return {
      name,
      result: Math.max(streak, longest),
    };
  }).sort(compareResultsDescending);
}

function MedianTimes(byPlayer: DataByPlayer) {
  return byPlayer.map(({name, results}) => ({
    name,
    result: results.sort((a, b) => (
      b.time - a.time
    ))[Math.floor(results.length / 2)]?.time,
  })).sort(compareResultsAscending)
     .map(({ name, result }) => ({
    name,
    result: isNaN(result) ? null : secondsToMinutes(result),
  }));
}

function NumberSolved(byPlayer: DataByPlayer) {
  return byPlayer.map(({name, results}) => ({
    name,
    result: results.length,
  })).sort(compareResultsDescending);
}

function PuzzlesWon(byPlayer: DataByPlayer, byDate: DataByDate): RankedListItem[] {
  const puzzlesWon = new Map();

  for (const {results} of byDate) {
    const winningTime = results[0].time;

    for (const {name, time} of results) {
      if (time !== winningTime) {
        break;
      }

      if (puzzlesWon.has(name)) {
        puzzlesWon.set(name, puzzlesWon.get(name) + 1);
      } else {
        puzzlesWon.set(name, 1);
      }
    }
  }

  return byPlayer.map(({name}) => ({
    name,
    result: puzzlesWon.get(name) ?? 0,
  })).sort(compareResultsDescending);
}

function SlowestTimes(byPlayer: DataByPlayer) {
  return byPlayer.map(({ name, results }) => {
    const r = results.sort((a, b) => (b.time - a.time));
    const slowest: PlayerResult = r.length ? r[0] : { date: "", time: 0 };
    return {
      name,
      result: slowest.time,
      date: slowest.date,
    }
  }).sort(compareResultsDescending)
    .map(({name, result, date}) => ({
      name,
      result: result > 0 ? secondsToMinutes(result) : null,
      link: result > 0 ? date : null,
    }));
}

function OverallPoints(byPlayer: DataByPlayer, byDate: DataByDate) {
  const ranks: Map<string, number[]> = new Map();

  for (const {name} of byPlayer) {
    ranks.set(name, []);
  }

  for (const {results} of byDate) {
    let lastTime;
    let pointsAwarded = 0
    let pointsPending = 0;

    for (const {name, time} of results.slice(0).reverse()) {
      if (time !== lastTime) {
        pointsAwarded += pointsPending;
        pointsPending = 0;
      }
      lastTime = time;

      const playerRanks = ranks.get(name);
      if (playerRanks) {
        playerRanks.push(pointsAwarded);
      }

      ++pointsPending;
    }
  }

  return Array.from(ranks).map(([name, points]) => ({
    name,
    result: points.reduce((a, b) => a + b, 0),
  })).sort(compareResultsDescending);
}

function Pokerstars(byPlayer: DataByPlayer, byDate: DataByDate) {
  /*
  From https://www.pokerstars.com/poker/tournaments/leader-board/explained/ (cached)
  Points = 10 * [sqrt(n)/sqrt(k)] * [1+log(b+0.25)]
  n is the number of entrants
  k is the place of finish (k=1 for the first-place finisher, and so on)
  b is the buy-in amount in US Dollars
  */
  const ranks: Map<string, number> = new Map();

  for (const {results} of byDate) {
    let lastRank = 0;
    let lastTime;

    for (const {name, time} of results) {
      const rank = time === lastTime ? lastRank : ++lastRank;
      lastTime = time;

      const playerRank = ranks.get(name) || 0;
      ranks.set(name, playerRank + (
        10.0 * Math.sqrt(results.length) / Math.sqrt(rank) *
        (1 + Math.log10(0.25))
      ));
    }
  }

  return Array.from(ranks).map(([name, points]) => ({
    name,
    result: points,
  })).sort(compareResultsDescending).map(({ name, result }) => ({
    name,
    result: result.toFixed(2),
  }));
}

interface DataProps {
  date: string;
  stats7: Statistics;
  stats30: Statistics;
  statsAll: Statistics;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const data = loadData();
  const date = getLatestPuzzleDate(dataByDate(data));
  return {
    props: {
      date: date,
      statsAll: generateStats(data),
      stats30: generateStats(data, 30),
      stats7: generateStats(data, 7),
    },
  }
}

function serializeLinks(list: RankedListItem[]): RankedListItem[] {
  return list.map(({ name, result, link }) => ({
    name: name,
    result: result,
    link: link ? <Link
      href="/leaderboard/[date]"
      as={`/leaderboard/${link}`}
    >{result}</Link> : null,
  }))
}

interface Statistics {
  puzzlesWon: RankedListItem[];
  numberSolved: RankedListItem[];
  longestStreak: RankedListItem[];
  currentStreak: RankedListItem[];
  averageTimes: RankedListItem[];
  medianTimes: RankedListItem[];
  fastestTimes: RankedListItem[];
  slowestTimes: RankedListItem[];
  averageRanks: RankedListItem[];
  medianRanks: RankedListItem[];
  overallPoints: RankedListItem[];
  pokerstars: RankedListItem[];
}

function generateStats(byPlayer: DataByPlayer, period?: number): Statistics {
  let byDate = dataByDate(byPlayer);
  let dateOrder = useDateOrder(byDate);

  if (period && period > 0) {
    const date = getLatestPuzzleDate(byDate);
    byPlayer = dataForPeriod(byPlayer, {
      start: getOffsetDate(dateOrder, date, 1 - period),
      end: date,
    });
    byDate = dataByDate(byPlayer);
    dateOrder = useDateOrder(byDate);
  }

  return {
    puzzlesWon: PuzzlesWon(byPlayer, byDate),
    numberSolved: NumberSolved(byPlayer),
    longestStreak: LongestStreak(byPlayer, dateOrder),
    currentStreak: CurrentStreak(byPlayer, dateOrder),
    averageTimes: AverageTimes(byPlayer),
    medianTimes: MedianTimes(byPlayer),
    fastestTimes: FastestTimes(byPlayer),
    slowestTimes: SlowestTimes(byPlayer),
    averageRanks: AverageRanks(byPlayer, byDate),
    medianRanks: MedianRanks(byPlayer, byDate),
    overallPoints: OverallPoints(byPlayer, byDate),
    pokerstars: Pokerstars(byPlayer, byDate),
  }
}

export default function Home({ date, statsAll, stats30, stats7 }: DataProps) {
  const { period } = useRouter().query;
  const periodDays = Array.isArray(period) ? period[0] : period;

  let s = statsAll;
  if (periodDays == '7') {
    s = stats7;
  } else if (periodDays == '30') {
    s = stats30;
  }

  return (
    <Layout title="NYT Crossword Stats">
      <Filters>
        <PeriodFilter href="/?period=7" isActive={s === stats7} title="Last 7 Days" />
        <PeriodFilter href="/?period=30" isActive={s === stats30} title="Last 30 Days" />
        <PeriodFilter href="/" isActive={s === statsAll} title="All Time" />
        <MessageContainer>
          <DateHeading>
            as of {toReadableDate(date)}
          </DateHeading>
        </MessageContainer>
      </Filters>
      <Container>
        <Stat list={s.puzzlesWon} title="Puzzles Won" />
        <Stat list={s.numberSolved} title="Puzzles Solved" />
        <Stat list={s.longestStreak} title="Longest Streak" />
        <Stat list={s.currentStreak} title="Current Streak" />
        <Stat list={s.averageTimes} title="Average Solve Time" />
        <Stat list={s.medianTimes} title="Median Solve Time" />
        <Stat list={serializeLinks(s.fastestTimes)} title="Fastest Solve Time" />
        <Stat list={serializeLinks(s.slowestTimes)} title="Slowest Solve Time" />
        <Stat list={s.averageRanks} title="Average Rank" />
        <Stat list={s.medianRanks} title="Median Rank" />
        <Stat
          list={s.overallPoints}
          title="Overall Points"
          subTitle="1 point per person outranked"
        />
        <Stat
          list={s.pokerstars}
          title="P* Tournament Points"
          subTitle="10*sqrt(entrants)/sqrt(rank)*(1 + log(0.25))"
        />
      </Container>
    </Layout>
  );
}
