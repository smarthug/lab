import React from 'react'
import Tree from 'rc-tree';
// import {Tree} from 'antd';
import './rcTree.css'
const testtreeData = [
    {
        title: 'parent 1',
        key: '0-0',
        children: [
            {
                title: 'parent 1-0',
                key: '0-0-0',

                children: [
                    {
                        title: 'leaf',
                        key: '0-0-0-0',
                        children: [
                            {
                                title: "hosuk",
                                key: 'wtf'
                            }
                        ]
                    },
                    {
                        title: 'leaf',
                        key: '0-0-0-1',
                    },
                ],
            },
            {
                title: 'parent 1-1',
                key: '0-0-1',
                children: [
                    {
                        title:

                            'sss'

                        ,
                        key: '0-0-1-0',
                    },
                ],
            },
        ],
    },
    {
        title: 'test',
        key: '0-0-0-0-0-0'
    }
];



function dig(path = '0', level = 3) {
    const list = [];
    for (let i = 0; i < 10; i += 1) {
      const key = `${path}-${i}`;
      const treeNode = {
        title: key,
        key,
      };
  
      if (level > 0) {
        treeNode.children = dig(key, level - 1);
      }
  
      list.push(treeNode);
    }
    return list;
  }
  
  const treeData = dig();

  let checker = true;

export default function Demo() {

    const [tree, setTree] = React.useState(treeData)

    function test(){
        console.log("test");
        checker ? setTree([...testtreeData]) : setTree([...treeData])
        checker=!checker;
    }
    const onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const onCheck = (checkedKeys, info) => {
        console.log('onCheck', checkedKeys, info);
    };

    const onLoadData = ({ key, children }) => {
        console.log(key)

        console.log(children);

        return new Promise((resolve) => {
            if (children) {
                resolve();
                return;
            }

        })
  }

    return (
        <>
        <button onClick={test}>TEST</button>
        <Tree
            checkable
            defaultExpandAll
            onSelect={onSelect}
            onCheck={onCheck}
            // loadData={onLoadData}
            treeData={tree}
            showIcon={false}
            height={233}
            itemHeight={20}
            
        />
        </>
    );
};