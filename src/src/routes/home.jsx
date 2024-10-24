import { Suspense, useState, useEffect, useRef, createElement } from 'react'
import { useLoaderData, defer, Form, Await, useRouteError, Link, useNavigate } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import Icon from './helper/MaterialIcon'
import Shimmer from './helper/Shimmer'
import { getTournamentList } from './../util/api'
import toast, { Toaster } from 'react-hot-toast'
import Heading from './helper/Heading'
import { useAuth, contracts, getDefaultChain } from './../contexts/AuthContext'
import Logo from './../../src/assets/logo.svg'
import Sticker1 from './../../src/assets/sticker1.png'
import party from 'party-js'
import styles from './Home.module.scss'
import Web3 from 'web3'
import Loading from './components/Loading'

party.resolvableShapes['logo'] = `<img src="${Logo}" style='width:24px'/>`

let isMouseDown = false
export const loader = async () => {
  return defer({ key: 'val' })
}

function Home({ title }) {
  Title(title)
  const [loaderData, setLoaderData] = useState(useLoaderData())
  const [isLoading, setIsLoading] = useState(true)
  const [showArtboard, setShowArtboard] = useState(false)
  const [color, setColor] = useState(``)
  const [tapCounter, setTapCounter] = useState(0)
  const [description, setDescription] = useState(``)
  const [count, setCount] = useState(1)
  const [selectedFile, setSelectedFile] = useState()
  const [stage1Token, setStage1Token] = useState([])
  const [layer, setLayer] = useState({ layers: [] })
  const auth = useAuth()
  const SVG = useRef()
  const navigate = useNavigate()
  const txtSearchRef = useRef()
  const SVGpreview = useRef()
  let selectedElement, offset
  const [isPageLoading, setIsPageLoading] = useState(true)
  const handleSearch = async () => {
    if (txtSearchRef.current.value.length < 3) {
      toast.error(`A name must be a minimum of 3 characters long.`)
      return
    }

    const t = toast.loading(`Searching`)

    contract.methods
      .toNodehash(txtSearchRef.current.value, selectedRecordType)
      .call()
      .then(async (res) => {
        console.log(res)
        await contract.methods
          ._freeToRegister(res)
          .call()
          .then((res) => {
            console.log(res)
            setFreeToRegister(!res)
            toast.dismiss(t)
          })
      })
  }

  const fetchIPFS = async (CID) => {
    try {
      const response = await fetch(`https://api.universalprofile.cloud/ipfs/${CID}`)
      if (!response.ok) throw new Response('Failed to get data', { status: 500 })
      const json = await response.json()
      // console.log(json)
      return json
    } catch (error) {
      console.error(error)
    }

    return false
  }

  const getMintPrice = async () => {
    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
    return await contract.methods.fee(`mint_price`).call()
  }

  const rAsset = async (imageURL) => {
    const assetBuffer = await fetch(imageURL).then(async (response) => {
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    })

    return assetBuffer
  }

  const copy = async () => {
    document.querySelectorAll(`#artboardSVG rect`).forEach((item) => {
      let modified = item.getAttribute(`modified`)
      if (modified === false) {
        item.style.fill = `transparent`
      }
    })
    try {
      const type = 'text/plain'
      const blob = new Blob([document.querySelector(`#artboardSVG`).outerHTML], { type })
      const data = [new ClipboardItem({ [type]: blob })]
      await navigator.clipboard.write(data)
      toast(`Copied`)
    } catch (error) {
      console.error(error.message)
    }
  }

  const download = () => {
    document.querySelectorAll(`.${styles['board']} rect`).forEach((item) => {
      let modified = item.getAttribute(`modified`)
      if (!modified) {
        // item.remove()
        item.style.fill = `transparent`
      }
    })
    const htmlStr = document.querySelector(`#artboardSVG`).outerHTML
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('download', 'Masterpix.svg')
    a.setAttribute('href', url)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const updatePreview = () => {
    // Update
    SVGpreview.current.innerHTML = SVG.current.innerHTML
    // ToDo: reading in page load doesnt work, need to add events to each rect.
    localStorage.setItem(`svg`, SVG.current.innerHTML)
  }

  const add = () => {
    if (layer.layers.filter((item) => item === `artboardLayer`).length > 0) {
      toast.error(`The artboard has already been created.`)
      return
    }
    setShowArtboard(true)
    rect()
    toast.success(`Artboard has been created`, { icon: `🖌️` })
    localStorage.removeItem(`draw`)
    updatePreview()
  }

  const draw = (e) => {
    let color = document.querySelector(`input[type='color']`).value
    if (e.button === 2) {
      color = `transparent` //e.target.getAttribute(`default-color`)
      isMouseDown = false
      e.target.setAttribute(`modified`, false)
    }
    if (e.button === 0 && isMouseDown && e.type === `mouseenter`) {
      e.target.style.fill = color || `red`
      e.target.setAttribute(`modified`, e.button === 2 ? false : true)
    } else if ((e.button === 0 && e.type === `click`) || e.type === `mousedown`) {
      e.target.style.fill = color || `red`
      e.target.setAttribute(`modified`, e.button === 2 ? false : true)
    }

    // Save draw
    const innerSVG = SVG.innerHTML
    localStorage.setItem(`draw`, innerSVG)

    // Update preview
    updatePreview()
  }

  const clear = () => {
    document.querySelectorAll(`.${styles['board']} rect`).forEach((item) => {
      item.style.fill = item.getAttribute(`default-color`)
      item.setAttribute(`modified`, false)
    })
    toast.success(`Artboard has been cleared`, { icon: `🧹` })

    // Update preview
    updatePreview()
  }

  const rect = () => {
    //document.querySelector(`#artboardSVG`).innerHTML = ''
    const countX = document.querySelector(`#x`).value
    const countY = document.querySelector(`#y`).value
    let width = 400 / countX
    let height = 400 / countY
    let colors = [`#F1F1F1`, `#D9D9D9`]
    let colorIndex = false
    console.log(`Width: ${width} | Height: ${height}`)

    const svgns = 'http://www.w3.org/2000/svg'
    const group = document.createElementNS(svgns, 'g')
    group.setAttribute('name', `artboardLayer`)
    setLayer({ layers: [...layer.layers, `artboardLayer`] })

    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        let rect = document.createElementNS(svgns, 'rect')
        rect.setAttribute('x', x * width)
        rect.setAttribute('y', y * height)
        rect.setAttribute('height', height)
        rect.setAttribute('width', width)
        rect.setAttribute('fill', colorIndex ? colors[0] : colors[1])
        rect.setAttribute('default-color', colorIndex ? colors[0] : colors[1])
        rect.onmouseenter = (e) => draw(e)
        rect.onmousedown = (e) => draw(e)

        group.appendChild(rect)
        // stroke={`red`} strokeOpacity={0.1} strokeWidth={1} key={`x${x}y${y}`}
        colorIndex = !colorIndex
      }
      colorIndex = !colorIndex
    }
    // Add rect group to SVG
    SVG.current.appendChild(group)
  }

  const changeHandler = (e) => {
    setSelectedFile(event.target.files[0])
  }

  const tokenURI = async () => {
    if (selectedFile) {
      try {
        const t = toast.loading(`Uploading to IPFS`)
        const upload = await pinata.upload.file(selectedFile)
        console.log(upload)
        toast.dismiss(t)
        return upload.IpfsHash
      } catch (error) {
        console.log(error)
      }
    } else {
      document.querySelectorAll(`.${styles['board']} rect`).forEach((item) => {
        let modified = item.getAttribute(`modified`)
        if (!modified) {
          // item.remove()
          item.style.fill = `transparent`
        }
      })

      const htmlStr = document.querySelector(`.${styles['board']} svg`).outerHTML
      const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      try {
        const t = toast.loading(`Uploading to IPFS`)
        const file = new File([blob], 'test.svg', { type: blob.type })
        const upload = await pinata.upload.file(file)
        console.log(upload)
        toast.dismiss(t)
        return upload.IpfsHash
      } catch (error) {
        console.log(error)
      }
    }
    //  })
    // const svg = `${document.querySelector(`#artboardSVG`).outerHTML}`;
    // console.log(svg)
    // return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  }

  const mint = async () => {
    if (document.querySelector(`#artboardSVG`).innerHTML === '' && selectedFile === undefined) {
      toast.error(`Please draw or choose a file`)
      return false
    }

    if (!auth.wallet) {
      auth.connectWallet()
      return
    }

    const web3 = new Web3(getDefaultChain() === `LUKSO` ? window.lukso : window.ethereum)
    const t = toast.loading(`Waiting for transaction's confirmation`)
    try {
      const imageUrl = await tokenURI()
      let rawMetadata

      if (auth.defaultChain === 'LUKSO') {
        const tConvert = toast.loading(`Generating metadata, takes two minutes...please wait`)
        rAsset(`https://ipfs.io/ipfs/${imageUrl}`).then((result) => {
          toast.dismiss(tConvert)
          console.log(result)
          console.log(`Verifiable URL`, web3.utils.keccak256(result))
          rawMetadata = web3.utils.toHex({
            LSP4Metadata: {
              name: assetname,
              description: `${description}`,
              links: [
                { title: 'Website', url: 'https://masterpix.art/' },
                { title: 'Mint', url: 'https://masterpix.art/' },
                { title: '𝕏', url: 'https://x.com/ArattaLabsDev' },
                { title: 'Telegram', url: 'https://t.me/arattalabs' },
              ],
              attributes: [{ key: 'Version', value: 1 }],
              icon: [{ width: 500, height: 500, url: 'ipfs://QmWpSVntG9Mmk9CHczf9ZACKDTuQMVUedEDcCdwwbqBs9b', verification: { method: 'keccak256(bytes)', data: '0xe303725c7fa6e0c8741376085a3859d858eb4d188afa6402bb39d34f40e5ed3f' } }],
              backgroundImage: [
                {
                  width: 1601,
                  height: 401,
                  url: 'ipfs://QmcTYAQmt7ZPbzR6w3XXzGwgfEu4zU2T4LLukqLBvJg2Eg',
                  verification: {
                    method: 'keccak256(bytes)',
                    data: '0x0fd8498ada7a39b1eb9f6ed54adc8950a84d5d79ad8418eb46fbcaf6a5c9638b',
                  },
                },
              ],
              assets: [],
              images: [[{ width: 500, height: 500, url: `ipfs://${imageUrl}`, verification: { method: 'keccak256(bytes)', data: web3.utils.keccak256(result) } }]],
            },
          })

          // mint
          const contract = new web3.eth.Contract(contracts[0].abi, contracts[0].contract_address)
          contract.methods
            .mint(rawMetadata, count)
            .send({
              from: auth.wallet,
              value: web3.utils.toWei(1, `ether`),
            })
            .then((res) => {
              console.log(res) //res.events.tokenId

              // Run partyjs
              party.confetti(document.querySelector(`header`), {
                count: party.variation.range(20, 40),
                shapes: ['logo'],
              })

              toast.success(`Transaction has been confirmed! Check out your NFTs`)
              toast.dismiss(t)
            })
            .catch((error) => {
              console.log(error)
              toast.dismiss(t)
            })
        })
      } else if (auth.defaultChain === 'Arbitrum') {
        const json = { name: assetname, description: description, image: `https://ipfs.io/ipfs/${imageUrl}`, version: '1' }
        rawMetadata = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(json))))

        // mint
        const contract = new web3.eth.Contract(contracts[1].abi, contracts[1].contract_address)
        contract.methods
          .mint(rawMetadata, count)
          .send({
            from: auth.wallet,
            value: web3.utils.toWei(1, `ether`),
          })
          .then((res) => {
            console.log(res) //res.events.tokenId

            // Run partyjs
            party.confetti(document.querySelector(`header`), {
              count: party.variation.range(20, 40),
              shapes: ['logo'],
            })

            toast.success(`Transaction has been confirmed! Check out your NFTs`)
            toast.dismiss(t)
          })
          .catch((error) => {
            console.log(error)
            toast.dismiss(t)
          })
      }
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  function getMousePosition(evt) {
    var CTM = SVG.current.getScreenCTM()
    if (evt.touches) {
      evt = evt.touches[0]
    }
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d,
    }
  }

  const deleteLayer = (groupName) => {
    SVG.current.querySelector(`SVG [name="${groupName}"]`).remove()
    setLayer({ layers: [...layer.layers.filter((item) => item !== groupName)] })

    // Update preview
    updatePreview()
  }

  const changeScale = (e, groupName) => {
    SVG.current.querySelector(`SVG [name="${groupName}"]`).setAttribute('transform', `scale(${e.target.value})`)
    // Update preview
    updatePreview()
  }

  const changeDimension = (e, type, groupName) => {
    let elem,
      value = e.target.value

    if (groupName === `artboardLayer`) elem = SVG.current.querySelector(`SVG [name="${groupName}"]`)
    else elem = SVG.current.querySelector(`SVG [name="${groupName}"] image`)

    if (type === `width`) elem.setAttribute(`width`, value)
    else if (type === `height`) elem.setAttribute(`height`, value)

    // Update preview
    updatePreview()
  }

  const addLayer = (url, name) => {
    // Conver image URL/ IPFS CID to blob
    fetch(`${url}`)
      .then((response) => response.blob())
      .then((blob) => {
        // const url = URL.createObjectURL(blob)

        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = function () {
          const base64data = reader.result

          const svgns = 'http://www.w3.org/2000/svg'
          const group = document.createElementNS(svgns, 'g')
          group.setAttribute('name', `${name}Layer${layer.layers.length + 1}`)
          setLayer({ layers: [...layer.layers, `${name}Layer${layer.layers.length + 1}`] })

          const image = document.createElementNS(svgns, 'image')
          let draggable = false
          image.setAttribute('href', base64data)
          image.setAttribute('width', 400)
          image.setAttribute('height', 400)
          image.setAttribute('x', 0)
          image.setAttribute('y', 0)
          image.style.cursor = `move`
          image.addEventListener(`mousedown`, (evt) => startDrag(evt, image))
          image.addEventListener(`mousemove`, (evt) => drag(evt, image))
          image.addEventListener(`mouseup`, (evt) => endDrag(evt, image))
          image.addEventListener(`mouseleave`, (evt) => endDrag(evt, image))

          // Add image to SVG
          group.appendChild(image)
          SVG.current.appendChild(group)

          // SVGJS(group)

          // Update preview
          updatePreview({ layers: [...layer.layers, `${name}Layer${layer.layers.length + 1}`] })
        }
      })
  }

  const startDrag = (evt, image) => {
    selectedElement = evt
    offset = getMousePosition(evt)
    offset.x -= parseFloat(image.getAttributeNS(null, 'x'))
    offset.y -= parseFloat(image.getAttributeNS(null, 'y'))
  }

  const drag = (evt, image) => {
    if (selectedElement) {
      var coord = getMousePosition(evt)
      image.setAttributeNS(null, 'x', coord.x - offset.x)
      image.setAttributeNS(null, 'y', coord.y - offset.y)
    }

    // Update preview
    updatePreview()
  }

  const endDrag = (evt, image) => {
    selectedElement = ''
    console.log(`endDrag`)

    // Update preview
    updatePreview()
  }

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
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

  const handleTap = (e) => {
    setTapCounter((oldVal) => oldVal + 1)
    const parent = document.querySelector(`#tap`)
    const drop = document.createElement('span')
    console.log(parent.getBoundingClientRect())
    drop.classList.add(`${styles.drop}`)
    console.log(e.clientX, e.clientY)
    drop.style.left = `${e.clientX - parent.getBoundingClientRect()['left']}px`
    drop.style.top = `${e.clientY - parent.getBoundingClientRect()['top']}px`
    parent.appendChild(drop)
    if ('vibrate' in navigator) navigator.vibrate(200)

    setTimeout(() => {
      drop.remove()
    }, 2500)
  }

  useEffect(() => {
    // getMintPrice().then((res) => console.log(res))
    // Restore prev draw
    // const innerSVG = document.querySelector(`.${styles['board']} svg`).innerHTML
    // if (localStorage.getItem(`draw`)) {
    //   setArtboard({x:})
    // }
    // Generate unique ID for the current device
    localStorage.setItem(`UUID`, crypto.randomUUID())
    setTimeout(() => {
      setIsPageLoading(false)
    }, 1000)
  }, [])
  // if (isPageLoading) return <Loading />
  return (
    <section className={`${styles.section} ms-motion-slideDownIn`}>
      <div className={`${styles.section__container} __container d-flex flex-column align-items-center justify-content-center`} data-width={`xxxlarge`}>

          <div className={`${styles.tour} d-flex flex-row align-items-center justify-content-between`}>
            <figure className={`d-flex flex-row align-items-center justify-content-between`}>
              <img src={Sticker1} />
              <figcaption>
                {import.meta.env.VITE_NAME} stickers <br/>
                coming soon
              </figcaption>
            </figure>
            <button className={`rounded ms-fontWeight-semibold d-f-c`}>Dive in</button>
          </div>

          <div className={`${styles.tapContainer} d-flex flex-column align-items-center justify-content-between`}>
            <ul className={`${styles.point} d-flex flex-column`}>
              <li className={`d-flex flex-row align-items-center justify-content-center`}>
                <span className={`${styles.coin}`}></span>
                <b> Standard</b>
                <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.37529 6.19377C3.74836 5.80649 3.74836 5.19351 3.37529 4.80623L0.556846 1.88045C0.315642 1.63006 0.315641 1.23375 0.556845 0.983359C0.81114 0.719379 1.2338 0.719379 1.4881 0.983359L5.17072 4.80623C5.5438 5.19351 5.5438 5.80649 5.17072 6.19377L1.4881 10.0166C1.2338 10.2806 0.811141 10.2806 0.556845 10.0166C0.315641 9.76625 0.315641 9.36994 0.556845 9.11955L3.37529 6.19377Z"
                    fill="white"
                  />
                </svg>
              </li>
              <li className={`d-f-c`}>
                <span>{tapCounter || 0}</span>
              </li>
              <li></li>
            </ul>

            <div id={`tap`} className={`${styles['tap']} animate pop`} onClick={(e) => handleTap(e)}>
              <svg width="192" height="258" viewBox="0 0 192 258" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M79.6118 83.4409C79.6118 97.3528 64.2273 114.928 51.1095 114.928C37.9916 114.928 27.3575 98.9271 27.3575 85.0152C27.3575 79.2857 27.4902 70.6249 32.1079 66.1229C38.7025 59.6936 51.3114 58.4731 59.0268 58.4731C72.1446 58.4731 79.6118 69.529 79.6118 83.4409Z"
                  fill="black"
                />
                <path
                  d="M174.62 85.0152C174.62 99.7966 169.445 113.354 157.202 113.354C144.958 113.354 130.283 99.7966 130.283 85.0152C130.283 70.2338 135.457 56.6768 147.701 56.6768C155.619 56.6768 163.952 66.3038 170.639 71.4184C171.524 72.0956 172.27 72.9549 172.661 73.9987C173.919 77.3585 174.62 81.0881 174.62 85.0152Z"
                  fill="black"
                />
                <path d="M112.098 221.817C113.534 221.011 114.267 219.324 113.792 217.747C107.088 195.441 78.0282 211.191 78.0282 217.261C78.0282 223.315 92.843 232.631 112.098 221.817Z" fill="black" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M154.034 242.451L170.599 215.578C179.544 201.069 186.228 185.154 188.646 168.281C192.144 143.879 192.392 121.246 188.383 88.0779C185.992 68.2893 180.593 48.228 167.391 33.295C157.069 21.6212 143.912 12.7564 122.524 2.91053C118.267 0.950463 113.611 0 108.924 0H87.0666C85.2661 0 83.4606 0.139687 81.6855 0.440859C63.0828 3.59702 53.7038 7.22125 40.0245 15.7436C-16.9796 47.2307 -10.6456 168.456 49.5253 242.451C65.5561 258.194 136.812 267.64 154.034 242.451ZM51.1095 114.928C64.2273 114.928 79.6118 97.3528 79.6118 83.4409C79.6118 69.529 72.1446 58.4731 59.0268 58.4731C51.3114 58.4731 38.7025 59.6936 32.1079 66.1229C27.4902 70.6249 27.3575 79.2857 27.3575 85.0152C27.3575 98.9271 37.9916 114.928 51.1095 114.928ZM157.202 113.354C169.445 113.354 174.62 99.7966 174.62 85.0152C174.62 81.0881 173.919 77.3585 172.661 73.9987C172.27 72.9549 171.524 72.0956 170.639 71.4184C163.952 66.3038 155.619 56.6768 147.701 56.6768C135.457 56.6768 130.283 70.2338 130.283 85.0152C130.283 99.7966 144.958 113.354 157.202 113.354ZM112.098 221.817C113.534 221.011 114.267 219.324 113.792 217.747C107.088 195.441 78.0282 211.191 78.0282 217.261C78.0282 223.315 92.843 232.631 112.098 221.817Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className={`${styles['energy']} d-f-c flex-column`}>
              <div className={`d-flex align-items-center`}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.86523 15.6634L7.61523 10.5001H4.42773L10.0383 2.40869H10.3846L9.64905 8.25007H13.399L7.21155 15.6634H6.86523Z" fill="#F5F5F5" />
                </svg>
                24h / <span className={`ms-fontSize-18 ms-fontWeight-bold`}>{1000 - tapCounter}</span>
              </div>

              <progress id="file" max={1000} value={1000 - tapCounter}>
                70%
              </progress>
            </div>
          </div>

      </div>
    </section>
  )
}

export default Home
