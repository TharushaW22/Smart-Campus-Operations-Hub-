import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const profileService = {
  updateProfile: (formData) => {
    return axios.patch(`${BASE_URL}/api/profile`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data)
  },
}

export default profileService
