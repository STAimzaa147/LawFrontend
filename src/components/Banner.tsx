"use client"

import styles from "./banner.module.css"
import Image from "next/image";

export default function Banner (){
    const covers = "/img/Banner.jpg"


    return(
        <div className={styles.banner} >
            <Image src={covers} 
            alt="cover"
            fill={true}
            priority
            objectFit="cover"/>
            <div className={styles.bannerText}>
                <h1 className="text-4xl font-medium">Let us assist you</h1>
                <h3 className="text-xl font-serif">in resolving your issues.</h3>
            </div>
        </div>
    );
}