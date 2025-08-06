import React from 'react';
import { ClipLoader } from 'react-spinners';

// लोडर को स्क्रीन के बीच में दिखाने के लिए स्टाइल
const loaderContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '80vh' // स्क्रीन की ज़्यादातर ऊंचाई ले लेगा
};

const Loader = () => {
    return (
        <div style={loaderContainerStyle}>
            {/* आप चाहें तो color और size बदल सकते हैं */}
            <ClipLoader color="var(--primary-color, #48bb78)" size={60} />
        </div>
    );
};

export default Loader;
