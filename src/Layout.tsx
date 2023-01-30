import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import {Suspense} from 'react';
import {useRouter} from 'next/router';

const Button = styled.button`
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: pointer;

  &:hover {
    background-color: #f4f4f4;
  }
`;

const BoardHeader = styled.div`
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

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  margin: auto;

  @media (max-width: 799px) {
    flex-direction: column;
    max-width: 600px;
  }
`;

const FixedContainer = styled.div`
  flex: 1;
  margin: auto;
  max-width: 600px;
  padding: 30px;
`;

const Header = styled.header`
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  min-width: 320px;
  padding: 0 24px;
  width: 100%;

  @media (max-width: 799px) {
    flex-direction: column;
    left: 0;
    padding-top: 12px;
  }
`;

const Logo = styled.img`
  height: 26px;

  @media (max-width: 799px) {
    height: 21px;
  }
`;

const MessageContainer = styled.div`
  padding: 30px;
  text-align: center;
`;

interface StyledLinkProps {
  isActive: boolean;
}

const StyledLink = styled.a<StyledLinkProps>`
  border-bottom: 3px solid;
  border-bottom-color: ${({isActive}) => isActive ? '#787886' : 'transparent'};
  color: #787886;
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  height: 64px;
  letter-spacing: 0.5px;
  line-height: 66px;
  margin-left: 50px;
  text-decoration: none;
  text-transform: uppercase;

  &:hover {
    border-color: #787886;
  }

  @media (max-width: 799px) {
    height: initial;
    line-height: initial;
    margin: 0 12px;
    padding: 6px 0;
  }
`;

interface NavLinkProps {
  as?: string;
  children: React.ReactNode;
  href: string;
}

function NavLink(props: NavLinkProps) {
  const {pathname} = useRouter();

  return (
    <Link href={props.href} as={props.as} passHref>
      <StyledLink isActive={pathname === props.href}>
        {props.children}
      </StyledLink>
    </Link>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

function Layout({ children, title }: LayoutProps) {
  return (
    <>
      <Head>
        <meta name="description" content="Leaderboard for the NYT mini" />
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header>
        <Link href="/">
          <a>
            <Logo src="/logo.svg" alt="NYT Crossword Stats" />
          </a>
        </Link>
        <nav>
          <NavLink href="/">
            Statistics
          </NavLink>
          <NavLink
            href="/leaderboard/[date]"
            as={`/leaderboard/latest`}
          >
            Leaderboards
          </NavLink>
        </nav>
      </Header>
      <Suspense fallback={<MessageContainer>loading...</MessageContainer>}>
        {children}
      </Suspense>
    </>
  );
}

export {
  Container,
  FixedContainer,
  Layout as default,
  MessageContainer,
  BoardHeader,
  StyledArrow,
  StyledDoubleArrow,
}
