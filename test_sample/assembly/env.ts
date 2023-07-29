
@external("env", "get_feature")
export declare function getFeature(featureId: i32) :i32

@external("env", "call0")
export declare function call0(func: i32) :i32

@external("env", "call1")
export declare function call1(func: i32, p1: i32) :i32

@external("env", "call2")
export declare function call2(func: i32, p1: i32, p2: i32) :i32

@external("env", "call3")
export declare function call3(func: i32, p1: i32, p2: i32, p3: i32) :i32

@external("env", "call4")
export declare function call4(func: i32, p1: i32, p2: i32, p3: i32, p4: i32) :i32
