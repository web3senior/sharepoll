import Logo from './../../../src/assets/logo.svg'
import styles from './Loading.module.scss'

const Loading = () => (
  <div className={styles['loading']}>
    <figure>
      <img alt={import.meta.env.VITE_TITLE} src={Logo} />
    </figure>
  </div>
)

export default Loading
