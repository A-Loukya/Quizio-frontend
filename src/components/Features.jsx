import React from 'react'

const Features = () => {
    return (
        <div className='text-white mt-32 mx-16 '>
            <h2 className='text-center mx-auto text-4xl font-Fredoka my-20'>Features</h2>
            <div className='flex justify-between'>
                <div className='w-4/12'>
                    <div>
                        {featuresArr.map((item, index) => (
                            <div
                                key={index}
                                className="text-center p-20 rounded-xl text-white shadow-[inset_0_1px_8px_rgba(255,255,255,0.1),inset_0_-4px_5px_rgba(0,0,0,0.3)] border border-[#2a2f3e] my-6"
                            >
                                {item.title}
                            </div>
                        ))}
                    </div>


                </div>
                <div>right</div>
            </div>
        </div>
    )
}
const featuresArr = [
    {
        title: "title1",
        text: "text1"
    },
    {
        title: "title2",
        text: "text2"
    },
    {
        title: "title3",
        text: "text3"
    },
    {
        title: "title4",
        text: "text4"
    },
]
export default Features