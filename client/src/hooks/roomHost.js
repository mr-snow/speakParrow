import axios from 'axios'
import React from 'react'

export const roomHosting=async(postData)=>{
    const response=await axios.post('900/host',postData)
    return response.data
}
