// components/OuraSkeletonLoader.js

function OuraSkeletonLoader() {
    return (
        <div>
            <div className="flex flex-wrap -m-4 px-2.5">
                <div className="w-full md:w-1/2 p-4">
                    <div className="animate-pulse flex-1 m-2 border border-gray-200 rounded-lg bg-white overflow-hidden pb-8">
                        <div className="h-8 bg-white rounded mt-4 mb-2 px-12"></div>
                        <div className="h-64 bg-white rounded m-4"></div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap -m-4 px-2.5">
                <div className="w-full md:w-1/2 p-4">
                    <div className="animate-pulse flex-1 m-2 border border-gray-200 rounded-lg bg-white overflow-hidden pb-8">
                        <div className="h-8 bg-white rounded mt-4 mb-2 px-12"></div>
                        <div className="h-64 bg-white rounded m-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OuraSkeletonLoader;
