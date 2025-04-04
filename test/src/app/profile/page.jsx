'use client';

import { useEffect, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'http://localhost:8000/graphql/';

const graphQLClient = new GraphQLClient(endpoint, {
  credentials: 'include',
});

const token = typeof window !== 'undefined' && localStorage.getItem('token');
if (token) {
  graphQLClient.setHeader('Authorization', `JWT ${token}`);
}

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      message
    }
  }
`;

const GET_PROFILE = gql`
  query {
    myProfile {
      firstName
      lastName
      phone
      street
      city
      landmark
      state
      country
      postalCode
    }
  }
`;

export default function ProfilePage() {
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    landmark: '',
    state: '',
    country: '',
    postalCode: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const variables = { input: profileForm };
      const response = await graphQLClient.request(UPDATE_PROFILE, variables);
      setMessage(response.updateProfile.message);
    } catch (err) {
      console.error(err);
      setMessage('Profile update failed.');
    }
  };

  // Fetch profile on component mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await graphQLClient.request(GET_PROFILE);
        console.log('Fetched profile data:', data);
  
        const profile = data.myProfile;
        if (profile) {
          setProfileForm({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phone: profile.phone || '',
            street: profile.street || '',
            city: profile.city || '',
            landmark: profile.landmark || '',
            state: profile.state || '',
            country: profile.country || '',
            postalCode: profile.postalCode || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Unable to fetch profile. Please log in again or try later.');
      }
    }
  
    fetchProfile();
  }, []);
  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Update Profile</h1>
      <form onSubmit={handleSubmit}>
        {Object.entries(profileForm).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              name={key}
              value={value}
              onChange={handleChange}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
        ))}
        <button type="submit" style={{ padding: '10px 20px', marginTop: 10 }}>
          Save Changes
        </button>
      </form>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
