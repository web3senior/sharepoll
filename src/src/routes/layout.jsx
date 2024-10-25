import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link, NavLink, useNavigate, useNavigation, ScrollRestoration } from 'react-router-dom'
import ConnectPopup from './components/ConnectPopup'
import { Toaster } from 'react-hot-toast'
import { useAuth, chain, getDefaultChain } from './../contexts/AuthContext'
import MaterialIcon from './helper/MaterialIcon'
import Icon from './helper/MaterialIcon'
import Logo from './../../src/assets/logo.svg'
import LogoIcon from './../../src/assets/logo.svg'
import Loading from './components/Loading'
import XIcon from './../../src/assets/icon-x.svg'
import CGIcon from './../../src/assets/icon-cg.svg'
import GitHubIcon from './../../src/assets/icon-github.svg'
import MenuIcon from './../../src/assets/menu-icon.svg'
import party from 'party-js'
import styles from './Layout.module.scss'

party.resolvableShapes['LogoIcon'] = `<img src="${LogoIcon}" style="width:24px"/>`

const links = [
  {
    name: 'Home',
    icon: null,
    target: '',
    path: ``,
  },
  {
    name: 'Submit Vote',
    icon: null,
    target: '',
    path: `marketplace`,
  },
  {
    name: 'Create Poll',
    icon: null,
    target: '',
    path: `ecosystem`,
  },
  {
    name: 'About',
    icon: null,
    target: '',
    path: `about`,
  },
]

export default function Root() {
  const [network, setNetwork] = useState()
  const [isLoading, setIsLoading] = useState()
  const auth = useAuth()

  const showNetworkList = () => document.querySelector(`.${styles['network-list']}`).classList.toggle(`d-none`)

  /**
   * Selected chain
   * @returns
   */
  const SelectedChain = () => {
    const filteredChain = chain.filter((item, i) => item.name === getDefaultChain())
    return <img alt={`${filteredChain[0].name}`} src={`${filteredChain[0].logo}`} title={`${filteredChain[0].name}`} />
  }

  const handleOpenNav = () => {
    document.querySelector('#modal').classList.toggle('open')
    document.querySelector('#modal').classList.toggle('blur')
    document.querySelector('.cover').classList.toggle('showCover')
  }

  useEffect(() => {}, [])

  return (
    <>
      <Toaster />
      <ScrollRestoration />

      <header className={`${styles.header}`}>
        <div className={`${styles.header__container} __container d-flex flex-row align-items-center justify-content-between h-100 ms-depth-4`} data-width={`xxxlarge`}>
          <Link to={`/`}>
            <figure className={`${styles['logo']}`}>
              <img alt={import.meta.env.VITE_TITLE} src={Logo} />
              <figcaption>{import.meta.env.VITE_NAME}</figcaption>
            </figure>
          </Link>

          <ul className={`${styles['nav']} d-flex flex-row align-items-center justify-content-start`}>
            {links.map((item, i) => {
              return (
                <li key={i}>
                  <NavLink to={item.path} target={item.target}>
                    {item.name}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className={`d-flex flex-row align-items-center justify-content-end`} style={{ columnGap: `.3rem` }}>
            <div className={`${styles['network']} d-flex align-items-center justify-content-end`} onClick={() => showNetworkList()}>
              {auth.defaultChain && <SelectedChain />}
            </div>

            {!auth.wallet ? (
              <>
                <button
                  className={styles['connect-button']}
                  onClick={(e) => {
                    party.confetti(document.querySelector(`header`), {
                      count: party.variation.range(20, 40),
                      shapes: ['LogoIcon'],
                    })
                    auth.connectWallet()
                  }}
                >
                  Connect
                </button>
              </>
            ) : (
              <Link to={`user/dashboard`} className={`${styles['profile']} d-f-c user-select-none`}>
                <div className={`${styles['profile__wallet']} d-f-c`}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <circle cx="12" cy="12" fill="#FF89341F" r="12"></circle>
                      <g transform="translate(4, 4) scale(0.3333333333333333)">
                        <path
                          clipRule="evenodd"
                          d="M24 0C26.2091 0 28 1.79086 28 4V10.7222C28 12.0586 29.6157 12.7278 30.5607 11.7829L35.314 7.02948C36.8761 5.46739 39.4088 5.46739 40.9709 7.02948C42.533 8.59158 42.533 11.1242 40.9709 12.6863L36.2179 17.4393C35.2729 18.3843 35.9422 20 37.2785 20H44C46.2091 20 48 21.7909 48 24C48 26.2091 46.2091 28 44 28H37.2783C35.9419 28 35.2727 29.6157 36.2176 30.5607L40.9705 35.3136C42.5326 36.8756 42.5326 39.4083 40.9705 40.9704C39.4084 42.5325 36.8758 42.5325 35.3137 40.9704L30.5607 36.2174C29.6157 35.2724 28 35.9417 28 37.2781V44C28 46.2091 26.2091 48 24 48C21.7909 48 20 46.2091 20 44V37.2785C20 35.9422 18.3843 35.2729 17.4393 36.2179L12.6866 40.9706C11.1245 42.5327 8.59186 42.5327 7.02977 40.9706C5.46767 39.4085 5.46767 36.8759 7.02977 35.3138L11.7829 30.5607C12.7278 29.6157 12.0586 28 10.7222 28H4C1.79086 28 0 26.2091 0 24C0 21.7909 1.79086 20 4 20L10.7219 20C12.0583 20 12.7275 18.3843 11.7826 17.4393L7.02939 12.6861C5.46729 11.124 5.4673 8.59137 7.02939 7.02928C8.59149 5.46718 11.1241 5.46718 12.6862 7.02928L17.4393 11.7824C18.3843 12.7273 20 12.0581 20 10.7217V4C20 1.79086 21.7909 0 24 0ZM24 33C28.9706 33 33 28.9706 33 24C33 19.0294 28.9706 15 24 15C19.0294 15 15 19.0294 15 24C15 28.9706 19.0294 33 24 33Z"
                          fill="#FF8934"
                          fillRule="evenodd"
                        ></path>
                      </g>
                    </g>
                  </svg>
                  <b>{auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}</b>
                </div>
              </Link>
            )}

            <div className={`${styles['network-list']} ms-depth-4 d-none`}>
              <ul>
                {auth.defaultChain &&
                  chain.length > 0 &&
                  chain.map((item, i) => {
                    return (
                      <li
                        key={i}
                        onClick={() => {
                          localStorage.setItem(`defaultChain`, item.name)
                          auth.setDefaultChain(item.name)
                          showNetworkList()
                          auth.isWalletConnected().then((addr) => {
                            auth.setWallet(addr)
                          })
                        }}
                      >
                        <figure className={`d-flex flex-row align-items-center justify-content-start`} style={{ columnGap: `.5rem` }}>
                          <img alt={`${item.name}`} src={item.logo} />
                          <figcaption>{item.name}</figcaption>
                          {item.name === auth.defaultChain && <Icon name={`check`} style={{ marginLeft: `auto`, color: `var(--color-primary)` }} />}
                        </figure>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
        </div>
      </header>

      <main className={`${styles.main}`}>
        <Outlet />
      </main>

      <footer>
        <ul className={`d-flex align-items-center justify-content-around`}>
          <li>
            <NavLink to={`/`} className={({ isActive, isPending }) => (isPending ? 'pending' : isActive ? `${styles.active}` : '')}>
              <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.43652 19.8332H9.78277V13.891H15.0903V19.8332H18.4365V10.8332L12.4365 6.31396L6.43652 10.8332V19.8332ZM4.93652 21.3332V10.0832L12.4365 4.43896L19.9365 10.0832V21.3332H13.5903V15.391H11.2828V21.3332H4.93652Z" />
              </svg>
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={`leaderboard`} className={({ isActive, isPending }) => (isPending ? 'pending' : isActive ? `${styles.active}` : '')}>
              <svg viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.8333H8.3365V11.8333H4V19.8333ZM9.8365 19.8333H14.1635V5.83325H9.8365V19.8333ZM15.6635 19.8333H20V13.8333H15.6635V19.8333ZM2.5 21.3333V10.3333H8.3365V4.33325H15.6635V12.3333H21.5V21.3333H2.5Z" />
              </svg>
              <span>Leaders</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={`frends`} className={({ isActive, isPending }) => (isPending ? 'pending' : isActive ? `${styles.active}` : '')}>
              <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.6885 14.5831V11.5831H15.6885V10.0831H18.6885V7.08314H20.1885V10.0831H23.1885V11.5831H20.1885V14.5831H18.6885ZM9.56348 12.5254C8.60098 12.5254 7.77706 12.1827 7.09173 11.4974C6.40623 10.8119 6.06348 9.98789 6.06348 9.02539C6.06348 8.06289 6.40623 7.23897 7.09173 6.55364C7.77706 5.86814 8.60098 5.52539 9.56348 5.52539C10.526 5.52539 11.3499 5.86814 12.0352 6.55364C12.7207 7.23897 13.0635 8.06289 13.0635 9.02539C13.0635 9.98789 12.7207 10.8119 12.0352 11.4974C11.3499 12.1827 10.526 12.5254 9.56348 12.5254ZM2.06348 20.1409V17.9176C2.06348 17.428 2.19648 16.9745 2.46248 16.5571C2.72848 16.1398 3.08398 15.819 3.52898 15.5946C4.51731 15.1101 5.51439 14.7467 6.52023 14.5044C7.52606 14.2621 8.54048 14.1409 9.56348 14.1409C10.5865 14.1409 11.6009 14.2621 12.6067 14.5044C13.6126 14.7467 14.6096 15.1101 15.598 15.5946C16.043 15.819 16.3985 16.1398 16.6645 16.5571C16.9305 16.9745 17.0635 17.428 17.0635 17.9176V20.1409H2.06348ZM3.56348 18.6409H15.5635V17.9176C15.5635 17.7151 15.5048 17.5276 15.3875 17.3551C15.2701 17.1828 15.1109 17.0421 14.9097 16.9331C14.0481 16.5088 13.1696 16.1873 12.2742 15.9686C11.3787 15.7501 10.4751 15.6409 9.56348 15.6409C8.65181 15.6409 7.74823 15.7501 6.85273 15.9686C5.95739 16.1873 5.07889 16.5088 4.21723 16.9331C4.01606 17.0421 3.85681 17.1828 3.73948 17.3551C3.62214 17.5276 3.56348 17.7151 3.56348 17.9176V18.6409ZM9.56348 11.0254C10.1135 11.0254 10.5843 10.8296 10.976 10.4379C11.3676 10.0462 11.5635 9.57539 11.5635 9.02539C11.5635 8.47539 11.3676 8.00456 10.976 7.61289C10.5843 7.22122 10.1135 7.02539 9.56348 7.02539C9.01348 7.02539 8.54264 7.22122 8.15098 7.61289C7.75931 8.00456 7.56348 8.47539 7.56348 9.02539C7.56348 9.57539 7.75931 10.0462 8.15098 10.4379C8.54264 10.8296 9.01348 11.0254 9.56348 11.0254Z" />
              </svg>
              <span>Frends</span>
            </NavLink>
          </li>
        </ul>
      </footer>
    </>
  )
}
