import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, contracts, getDefaultChain } from '../contexts/AuthContext'
import { getPoint } from '../util/api'
import { Title } from './helper/DocumentTitle'
import Icon from './helper/MaterialIcon'
import Logo from './../../src/assets/logo.svg'
import Web3 from 'web3'
import styles from './Frends.module.scss'
import toast from 'react-hot-toast'

export default function Owned({ title }) {
  Title(title)
  const [data, setData] = useState({ point: [] })
  const [taotlRecordType, setTotalRecordType] = useState(0)
  const [totalResolve, setTotalResolve] = useState(0)
  const auth = useAuth()

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const getMintPrice = async () => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.fee(`mint_price`).call()
  }
  const getDataForTokenId = async (tokenId) => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.getDataForTokenId(`${tokenId}`, '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e').call()
  }
  const getTokenIds = async (addr) => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.tokenIdsOf(addr).call()
  }
  const getDataBatchForTokenIds = async (tokenIds, dataKeys) => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.getDataBatchForTokenIds(tokenIds, dataKeys).call()
  }
  const getTotalResolve = async () => await contract.methods._resolveCounter().call()
  const getResolveList = async (wallet) => await contract.methods.getDomainList(wallet).call()
  const getTotalSupply = async () => await contract.methods.totalSupply().call()
  const getCouncilMintExpiration = async () => await contract.methods.councilMintExpiration().call()
  const getMaxSupply = async () => await contract.methods.MAX_SUPPLY().call()

  const handleCopy = async () => {
    navigator.clipboard.writeText(`${import.meta.env.VITE_BASE_URL}?representative=${localStorage.getItem(`UUID`)}`).then(
      function () {
        toast.success(`The invite link has been successfully copied.`)
      },
      function (err) {
        toast.success(`${err}`)
      }
    )
  }

  useEffect(() => {}, [])

  return (
    <section className={styles.section}>
      <div className={`${styles['container']} __container ms-motion-slideUpIn`} data-width={`small`}>
        <div className={`${styles['pageTitle']}`}>Invite friends and get more Kodama</div>

        <figure className={`d-f-c mt-40`}>
          <img className={`rounded`} src={Logo} />
        </figure>

        <div className={`mt-40`}>
          <input type={`text`} value={`${import.meta.env.VITE_BASE_URL}?representative=${localStorage.getItem(`UUID`)}`} />
          <button className={`mt-20`} onClick={handleCopy}>Invite friends</button>
        </div>
      </div>
    </section>
  )
}
