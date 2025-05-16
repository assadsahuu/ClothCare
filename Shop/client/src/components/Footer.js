import { Footer } from 'flowbite-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { BsFacebook, BsInstagram, BsGithub, BsTwitter } from 'react-icons/bs'

function Foooter() {
    return (
        <Footer container className="order border-t-8 border-teal-500">
            <div className="w-full max-w-7xl mx-auto">
                <div className=" grid w-full justify-between sm:flex md:grid-cols-1">
                    <div className="mt-5">
                        <Link to="/" className='self-center whitespace-nowrap text-lg 
                              sm:text-xl font-semibold dark:text-white  '>
                            <span className='px-2 py-1 bg-gradient-to-r from-blue-500
                            via-purple-500 to-purple-300 rounded-xl text-white
                            ' >ClothCare</span>
                           
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-8 mt-4  sm:grid-cols-3
                    sm:gap-6">
                        <div>
                            <Footer.Title title='About'></Footer.Title>
                            <Footer.LinkGroup col>
                                
                                <Footer.Link
                                    href="/About"
                                    target='-blank'
                                    rel='noopener noreferrer'
                                >
                                    About Us
                                </Footer.Link>
                            </Footer.LinkGroup>
                        </div>
                        <div>
                            <Footer.Title title='Follow Us'></Footer.Title>
                            <Footer.LinkGroup col>
                                <Footer.Link
                                    href="https://github.com/assadsahuu"
                                    target='-blank'
                                    rel='noopener noreferrer'
                                >
                                    Github
                                </Footer.Link>
                                <Footer.Link
                                    href="#"
                                    target='-blank'
                                    rel='noopener noreferrer'
                                >
                                    Discord
                                </Footer.Link>
                            </Footer.LinkGroup>
                        </div>
                        <div>
                            <Footer.Title title='Legal'></Footer.Title>
                            <Footer.LinkGroup col>
                                <Footer.Link
                                    href="#"
                                    target='-blank'
                                    rel='noopener noreferrer'
                                >
                                    Privacy Policy
                                </Footer.Link>
                                <Footer.Link
                                    href="#"
                                    target='-blank'
                                    rel='noopener noreferrer'
                                >
                                    Terms & Conditions
                                </Footer.Link>
                            </Footer.LinkGroup>
                        </div>
                    </div>

                </div>
                <Footer.Divider />
                <div className=" w-full sm:flex sm:items-center sm:justify-center">
                    <Footer.Copyright href='#' by="ClothCare" year={new Date().getFullYear()}></Footer.Copyright>
                </div>
                <div className="flex gap-6 sm:justify-center  mt-4">
                    <Footer.Icon href='#' icon={BsFacebook} />
                    <Footer.Icon href='#' icon={BsInstagram} />
                    <Footer.Icon href='#' icon={BsTwitter} />
                    <Footer.Icon href='#' icon={BsGithub} />
                </div>
            </div>
        </Footer>
    )
}

export default Foooter