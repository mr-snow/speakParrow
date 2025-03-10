import React from 'react';
import { Spin, Flex } from 'antd';

const contentStyle = {
  padding: 50,
  borderRadius: 4,
};

const content = <div style={contentStyle} />;

const LoadSpinner = () => (
  <Flex gap="middle" className="custom-spin" vertical>
    <Flex gap="middle">
      <Spin tip="Loading" className="custom-spin">
        {content}
      </Spin>
    </Flex>
  </Flex>
);

export default LoadSpinner;
