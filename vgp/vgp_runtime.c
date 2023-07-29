#include <vgp_runtime.h>
#include <vgp_error.h>

// Runtime API Implements
static int32_t vgp_get_feature(int32_t feature_id) {
    return INT32_MIN;
}

static int32_t vgp_call0(int32_t function_id) {
    return INT32_MIN;
}

static int32_t vgp_call1(int32_t function_id, int32_t p1) {
    return INT32_MIN;
}

static int32_t vgp_call2(int32_t function_id, int32_t p1, int32_t p2) {
    return INT32_MIN;
}

static int32_t vgp_call3(int32_t function_id, int32_t p1, int32_t p2, int32_t p3) {
    return INT32_MIN;
}

static int32_t vgp_call4(int32_t function_id, int32_t p1, int32_t p2, int32_t p3, int32_t p4) {
    return INT32_MIN;
}

// Do Link Functions
m3ApiRawFunction(__get_feature) {
    m3ApiGetArg(int32_t, feature_id);
    int32_t value = vgp_get_feature(feature_id);
    m3ApiReturnType(int32_t);
    m3ApiReturn(value);
}

m3ApiRawFunction(__call0) {
    m3ApiGetArg(int32_t, function_id);
    int32_t value = vgp_call0(function_id);
    m3ApiReturnType(int32_t);
    m3ApiReturn(value);
}

m3ApiRawFunction(__call1) {
    m3ApiGetArg(int32_t, function_id);
    m3ApiGetArg(int32_t, p1);
    int32_t value = vgp_call1(function_id, p1);
    m3ApiReturnType(int32_t);
    m3ApiReturn(value);
}

m3ApiRawFunction(__call2) {
    m3ApiGetArg(int32_t, function_id);
    m3ApiGetArg(int32_t, p1);
    m3ApiGetArg(int32_t, p2);
    int32_t value = vgp_call2(function_id, p1, p2);
    m3ApiReturnType(int32_t);
    m3ApiReturn(value);
}

m3ApiRawFunction(__call3) {
    m3ApiGetArg(int32_t, function_id);
    m3ApiGetArg(int32_t, p1);
    m3ApiGetArg(int32_t, p2);
    m3ApiGetArg(int32_t, p3);
    int32_t value = vgp_call3(function_id, p1, p2, p3);
    m3ApiReturnType(int32_t);
    m3ApiReturn(value);
}

m3ApiRawFunction(__call4) {
    m3ApiGetArg(int32_t, function_id);
    m3ApiGetArg(int32_t, p1);
    m3ApiGetArg(int32_t, p2);
    m3ApiGetArg(int32_t, p3);
    m3ApiGetArg(int32_t, p4);
    int32_t value = vgp_call4(function_id, p1, p2, p3, p4);
    m3ApiReturnType(int32_t);
    m3ApiReturn(value);
}

M3Result __vgp_link_runtime(IM3Module module) {
    m3_LinkRawFunction(module, "env", "get_feature", "i(i)", __get_feature);
    m3_LinkRawFunction(module, "env", "call0", "i(i)", __call0);
    m3_LinkRawFunction(module, "env", "call1", "i(ii)", __call1);
    m3_LinkRawFunction(module, "env", "call2", "i(iii)", __call2);
    m3_LinkRawFunction(module, "env", "call3", "i(iiii)", __call3);
    m3_LinkRawFunction(module, "env", "call4", "i(iiiii)", __call4);
    return m3Err_none;
}
